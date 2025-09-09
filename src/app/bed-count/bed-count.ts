import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Label } from '../label/label';
import { HttpClient } from '@angular/common/http';

interface Bed { id: number; occupied: boolean }
interface Room { id: number; beds: Bed[] }
interface Floor { id: number; rooms: Room[] }

type OccupantRaw = { key?: string; room_number?: string; bed_number?: string; rent_paid_so_for?: string; advance_paid_so_for?: string; [k: string]: any };
type Occupant = OccupantRaw & { _rentNum: number; _advanceNum: number; totalPaid: number };

type MapResult = {
  floors: Floor[];
  occupants: Occupant[];
  totals: { beds: number; occupied: number; unoccupied: number; rentCollected?: number; advanceCollected?: number; totalPaid?: number };
};

@Component({
  selector: 'app-bed-count',
  standalone: true,
  imports: [CommonModule, FormsModule, Label],
  templateUrl: './bed-count.html',
  styleUrls: ['./bed-count.scss']
})
export class BedCount {
  menuLabel = 'Bed Counts & Occupancy';
  floors: Floor[] = [];
  res: any;
  occupants: Occupant[] = [];
  fullValue: MapResult | null = null;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  async ngOnInit(): Promise<void> {
    // initial floors
    this.floors = [
      {
        id: 0, rooms: [
          { id: 1, beds: [{ id: 1, occupied: false }, { id: 2, occupied: false }, { id: 3, occupied: false }, { id: 4, occupied: false }] },
          { id: 2, beds: [{ id: 1, occupied: false }, { id: 2, occupied: false }] },
        ]
      },
      {
        id: 1, rooms: [
          { id: 1, beds: [{ id: 1, occupied: false }, { id: 2, occupied: false }, { id: 3, occupied: false }] },
          { id: 2, beds: [{ id: 1, occupied: false }, { id: 2, occupied: false }, { id: 3, occupied: false }, { id: 4, occupied: false }] },
          { id: 3, beds: [{ id: 1, occupied: false }, { id: 2, occupied: false }] },
        ]
      },
      {
        id: 2, rooms: [
          { id: 1, beds: [{ id: 1, occupied: false }, { id: 2, occupied: false }, { id: 3, occupied: false }] },
          { id: 2, beds: [{ id: 1, occupied: false }, { id: 2, occupied: false }] },
          { id: 3, beds: [{ id: 1, occupied: false }, { id: 2, occupied: false }, { id: 3, occupied: false }, { id: 4, occupied: false }] }
        ]
      },
      {
        id: 3, rooms: [
          { id: 1, beds: [{ id: 1, occupied: false }, { id: 2, occupied: false }, { id: 3, occupied: false }, { id: 4, occupied: false }] },
          { id: 2, beds: [{ id: 1, occupied: false }, { id: 2, occupied: false }, { id: 3, occupied: false }, { id: 4, occupied: false }] }
        ]
      }
    ];

    try {
      const response = await this.http.get<{ [key: string]: any }>('https://hostel-management-system-4f29a-default-rtdb.firebaseio.com/newcustomer.json').toPromise();

      if (response) {
        // flatten the keyed object into an array with key property
        this.res = Object.entries(response).map(([key, value]) => ({ key, ...value }));
        console.log('raw res:', this.res);

        // prepare occupants (coerce numeric values)
        this.prepareOccupantsFromRes();

        // map occupants to floors and get full result
        const full = this.mapOccupantsToFloors(this.occupants, this.floors);
        this.fullValue = full; // store result for later use (template, debug, etc.)

        // update local floors & occupants (mapOccupantsToFloors mutates floors but we set explicitly)
        this.floors = full.floors;
        this.occupants = full.occupants;

        // detect changes in case template needs update
        this.cdr.detectChanges();

        console.log('fullValue:', this.fullValue);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  // Build this.occupants from this.res and coerce numeric fields
  prepareOccupantsFromRes() {
    const raw = Array.isArray(this.res) ? this.res : (this.res ? [ ...this.res ] : []);
    this.occupants = raw.map((o: OccupantRaw) => {
      const rent = Number(String(o?.rent_paid_so_for ?? '0').replace(/,/g, '')) || 0;
      const advance = Number(String(o?.advance_paid_so_for ?? '0').replace(/,/g, '')) || 0;
      return {
        ...o,
        _rentNum: rent,
        _advanceNum: advance,
        totalPaid: rent + advance
      } as Occupant;
    });
  }

  /**
   * Map occupants -> floors (mutates floors by default) and return a MapResult
   */
  mapOccupantsToFloors(occupants: Occupant[], floors: Floor[]): MapResult {
    if (!Array.isArray(occupants)) occupants = [];
    if (!Array.isArray(floors)) floors = [];

    // reset occupancy on the floors (opt-in)
    floors.forEach(f => f.rooms.forEach(r => r.beds.forEach(b => b.occupied = false)));

    occupants.forEach((occ, idx) => {
      const roomNumStr = String(occ.room_number ?? '').padStart(4, '0'); // ensure length >=4
      const bedStr = String(occ.bed_number ?? '').trim();

      // find first non-zero digit scanning from right (index 0 = ones place)
      const reversed = roomNumStr.split('').reverse();
      let foundIndex = -1;
      let digitChar = '';
      for (let i = 0; i < reversed.length; i++) {
        if (reversed[i] !== '0') { foundIndex = i; digitChar = reversed[i]; break; }
      }

      if (foundIndex === -1) {
        console.warn(`Occupant[${idx}] has invalid room_number: "${occ.room_number}" — skipping mapping.`);
        return;
      }

      const floorId = foundIndex;                  // 0 -> floor 0, 1 -> floor 1, etc.
      const roomId = Number(digitChar);            // digit char becomes room id (1,2,...)

      if (!Number.isFinite(roomId) || roomId <= 0) {
        console.warn(`Occupant[${idx}] parsed room id invalid from "${occ.room_number}" -> ${digitChar}`);
        return;
      }

      // Parse bed labels: accept separators , or . and whitespace. Letters a->1, b->2 etc.
      const bedParts = bedStr.length ? bedStr.split(/[,\.]/).map(s => s.trim()).filter(Boolean) : [];
      if (bedParts.length === 0) {
        console.warn(`Occupant[${idx}] has no bed_number: "${occ.bed_number}" — nothing to mark.`);
        return;
      }

      const bedIndices: number[] = bedParts.map(p => {
        const lower = p.toLowerCase();
        if (/^[a-z]$/.test(lower)) {
          return lower.charCodeAt(0) - 'a'.charCodeAt(0) + 1; // 'a' -> 1, 'b' -> 2
        }
        // if numeric, try parse
        const asNum = Number(p);
        return Number.isFinite(asNum) ? asNum : NaN;
      }).filter(n => Number.isFinite(n) && n > 0);

      if (bedIndices.length === 0) {
        console.warn(`Occupant[${idx}] bed_number "${occ.bed_number}" could not be parsed -> ${bedParts}`);
        return;
      }

      // Find floor object
      const floor = floors.find(f => f.id === floorId);
      if (!floor) {
        console.warn(`Could not find floor ${floorId} for occupant[${idx}] room "${occ.room_number}"`);
        return;
      }

      // Find room object
      const room = floor.rooms.find(r => r.id === roomId);
      if (!room) {
        console.warn(`Could not find room ${roomId} on floor ${floorId} for occupant[${idx}] room "${occ.room_number}"`);
        return;
      }

      // Mark each bed index occupied = true if that bed exists
      bedIndices.forEach(bidx => {
        const bed = room.beds.find(b => b.id === bidx);
        if (bed) {
          bed.occupied = true;
        } else {
          console.warn(`Bed ${bidx} not found in room ${roomId} (floor ${floorId}) for occupant[${idx}]`);
        }
      });
    });

    // compute building totals
    const totals = floors.reduce((acc, f) => {
      acc.beds += f.rooms.reduce((rsum, r) => rsum + r.beds.length, 0);
      acc.occupied += f.rooms.reduce((rsum, r) => rsum + r.beds.filter(b => b.occupied).length, 0);
      return acc;
    }, { beds: 0, occupied: 0, unoccupied: 0, rentCollected: 0, advanceCollected: 0, totalPaid: 0 } as { beds: number; occupied: number; unoccupied: number; rentCollected: number; advanceCollected: number; totalPaid: number });

    totals.unoccupied = totals.beds - totals.occupied;
    totals.rentCollected = occupants.reduce((s, o) => s + (o._rentNum || 0), 0);
    totals.advanceCollected = occupants.reduce((s, o) => s + (o._advanceNum || 0), 0);
    totals.totalPaid = (totals.rentCollected || 0) + (totals.advanceCollected || 0);

    // return the full result (floors mutated in place)
    return {
      floors,
      occupants,
      totals
    };
  }

  // accessor to retrieve the last computed full value
  getFullValue(): MapResult | null {
    return this.fullValue;
  }

  // small helpers for template usage
  floorRoomCount(floor: Floor) { return floor.rooms.length }
  roomBedCount(room: Room) { return room.beds.length }
  roomOccupiedCount(room: Room) { return room.beds.filter(b => b.occupied).length }
  roomUnoccupiedCount(room: Room) { return room.beds.filter(b => !b.occupied).length }
  floorTotalBeds(floor: Floor) { return floor.rooms.reduce((sum, r) => sum + this.roomBedCount(r), 0) }
  floorOccupiedBeds(floor: Floor) { return floor.rooms.reduce((sum, r) => sum + this.roomOccupiedCount(r), 0) }
  buildingTotals() {
    const totals = this.floors.reduce((acc, f) => { acc.beds += this.floorTotalBeds(f); acc.occupied += this.floorOccupiedBeds(f); return acc; }, { beds: 0, occupied: 0, unoccupied: 0 } as any);
    totals.unoccupied = totals.beds - totals.occupied;
    return totals;
  }

  toggleBed(floor: Floor, room: Room, bed: Bed) {
    // bed.occupied = !bed.occupied;
  }
}
