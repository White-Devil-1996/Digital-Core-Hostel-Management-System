// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-documents',
//   imports: [],
//   templateUrl: './documents.html',
//   styleUrl: './documents.scss'
// })
// export class Documents {

// }


/* documents.component.ts */
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Label } from '../label/label';

type DocCategory = 'Resident' | 'Agreement' | 'Payment' | 'Policy' | 'Staff';

interface DocItem {
  id: string;
  name: string;
  category: DocCategory;
  uploadedOn: string;   // ISO date
  uploadedBy?: string | null;
  expiryDate?: string;  // optional ISO date
  mime: string;
  url: string;          // blob / remote url
  size: number;         // bytes
  notes?: string | null;
}


@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatIconModule, MatButtonModule, MatChipsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatDividerModule,
    MatListModule, MatTooltipModule,Label
  ],
  templateUrl: './documents.html',
  styleUrls: ['./documents.scss']
})
export class Documents implements OnInit {
  categories: DocCategory[] = ['Resident', 'Agreement', 'Payment', 'Policy', 'Staff'];
  menuLabel = 'Documents';
  // in-memory document store (replace with real API)
  docs = signal<DocItem[]>([]);

  // uploader
  openUploader = false;
  stagedFiles: File[] = [];
 uploadForm!: FormGroup; 

  // preview state
  preview: DocItem | null = null;
  dragging = false;

  // filters & search
  filterCategory: '' | DocCategory = '';
  q = '';

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {

    this.uploadForm = this.fb.group({
      category: ['Resident', Validators.required],
      uploadedBy: ['Admin'],
      expiryDate: [''],
      notes: ['']
    });
    // load some mock docs for demo
    const nowIso = new Date().toISOString();
    this.docs.set([
      {
        id: this.id(),
        name: 'Aadhaar_navin.pdf',
        category: 'Resident',
        uploadedOn: nowIso,
        uploadedBy: 'Navin',
        expiryDate: '2030-01-01',
        mime: 'application/pdf',
        url: 'assets/sample/aadhaar-sample.pdf',
        size: 34567
      }
    ]);
  }

  /* ----------------------------
     Upload helpers
     ---------------------------- */
  onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files) return;
    for (let i = 0; i < input.files.length; i++) {
      const f = input.files[i];
      if (f.size > 10 * 1024 * 1024) { // 10MB limit
        Swal.fire('File too large', `${f.name} exceeds 10MB limit`, 'warning');
        continue;
      }
      this.stagedFiles.push(f);
    }
  }

  onDragOver(e: DragEvent) { e.preventDefault(); this.dragging = true; }
  onDragLeave(e: DragEvent) { e.preventDefault(); this.dragging = false; }
  onDrop(e: DragEvent) {
    e.preventDefault(); this.dragging = false;
    const dt = e.dataTransfer;
    if (!dt?.files) return;
    for (let i = 0; i < dt.files.length; i++) {
      const f = dt.files[i];
      if (f.size > 10 * 1024 * 1024) { Swal.fire('File too large', `${f.name} exceeds 10MB`, 'warning'); continue; }
      this.stagedFiles.push(f);
    }
  }

  removeStaged(i: number) { this.stagedFiles.splice(i, 1); }
  clearStaged() { this.stagedFiles = []; }

  async uploadFiles() {
    if (!this.stagedFiles.length) { Swal.fire('No files', 'Please select files to upload', 'info'); return; }
    if (this.uploadForm.invalid) { Swal.fire('Fill details', 'Please choose a category', 'warning'); return; }

    // Simulate upload: create blob URLs and push to docs
    const category = this.uploadForm.value.category as DocCategory;
    const uploadedBy = this.uploadForm.value.uploadedBy;
    const expiryDate = this.uploadForm.value.expiryDate;
    const notes = this.uploadForm.value.notes;

    const created: DocItem[] = [];
    for (const f of this.stagedFiles) {
      const blobUrl = URL.createObjectURL(f);
      const doc: DocItem = {
        id: this.id(),
        name: f.name,
        category,
        uploadedOn: new Date().toISOString(),
        uploadedBy,
        expiryDate: expiryDate || undefined,
        mime: f.type || this.fallbackMime(f.name),
        url: blobUrl,
        size: f.size,
        notes
      };
      created.push(doc);
    }

    // pretend network delay
    Swal.fire({ title: 'Uploading...', didOpen: () => Swal.showLoading(), allowOutsideClick: false });
    await new Promise(r => setTimeout(r, 800));
    Swal.close();

    this.docs.update(list => [...created, ...list]);
    this.stagedFiles = [];
    this.uploadForm.patchValue({ notes: '', expiryDate: '' });
    this.openUploader = false;

    Swal.fire({ icon: 'success', title: 'Uploaded', text: `${created.length} file(s) uploaded`, timer: 1400, showConfirmButton: false });
  }

  /* ----------------------------
     Preview / Download / Delete
     ---------------------------- */
  previewDoc(d: DocItem) {
    // if URL is remote, ensure safe embedding; here we trust blob or asset urls
    this.preview = d;
  }

  downloadDoc(d: DocItem) {
    // For blobs we created via createObjectURL, we can trigger download:
    const link = document.createElement('a');
    link.href = d.url;
    link.download = d.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async confirmDelete(d: DocItem) {
    const res = await Swal.fire({
      title: 'Delete document?',
      text: `Are you sure you want to delete "${d.name}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    });

    if (res.isConfirmed) {
      // delete
      this.docs.update(list => list.filter(x => x.id !== d.id));
      if (this.preview?.id === d.id) this.preview = null;
      Swal.fire({ icon: 'success', title: 'Deleted', timer: 1100, showConfirmButton: false });
    }
  }

  /* ----------------------------
     Auto-generate agreement (mock)
     ---------------------------- */
  async autoGenerateAgreement() {
    const category = 'Agreement' as DocCategory;
    const name = `PG-Agreement-${Date.now()}.pdf`;

    Swal.fire({ title: 'Generating agreement...', didOpen: () => Swal.showLoading(), allowOutsideClick: false });
    // create a simple blob (in real app you'd generate a proper PDF server-side)
    const text = `PG Agreement\n\nResident: (Name)\nDate: ${new Date().toLocaleDateString()}\n\nThis is a generated agreement stub.`;
    const blob = new Blob([text], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    await new Promise(r => setTimeout(r, 700));
    Swal.close();

    const doc: DocItem = {
      id: this.id(),
      name,
      category,
      uploadedOn: new Date().toISOString(),
      uploadedBy: 'System',
      mime: 'application/pdf',
      url,
      size: blob.size
    };

    this.docs.update(list => [doc, ...list]);
    Swal.fire({ icon: 'success', title: 'Agreement generated', timer: 1200, showConfirmButton: false });
  }

  /* ----------------------------
     Helpers & filters
     ---------------------------- */
  get filteredDocs(): DocItem[] {
    const all = this.docs();
    const q = (this.q || '').trim().toLowerCase();
    const filtered = all.filter(d => {
      if (this.filterCategory && d.category !== this.filterCategory) return false;
      if (!q) return true;
      return d.name.toLowerCase().includes(q) ||
             (d.notes || '').toLowerCase().includes(q) ||
             d.category.toLowerCase().includes(q);
    });
    return filtered;
  }

  isImage(mime: string) { return mime.startsWith('image/'); }
  isPdf(mime: string) { return mime === 'application/pdf'; }
  iconFor(mime: string) {
    if (mime.startsWith('image/')) return 'image';
    if (mime === 'application/pdf') return 'picture_as_pdf';
    return 'insert_drive_file';
  }
  fallbackMime(name: string) {
    const ext = name.split('.').pop()?.toLowerCase();
    if (['png','jpg','jpeg','gif'].includes(ext || '')) return 'image/' + (ext === 'jpg' ? 'jpeg' : ext);
    if (ext === 'pdf') return 'application/pdf';
    return 'application/octet-stream';
  }

  daysUntil(d: DocItem) {
    if (!d.expiryDate) return '';
    const now = new Date();
    const ex = new Date(d.expiryDate);
    const diff = Math.ceil((ex.getTime() - now.getTime()) / (1000*60*60*24));
    return diff >= 0 ? String(diff) : '0';
  }
  isExpired(d: DocItem) {
    if (!d.expiryDate) return false;
    return new Date(d.expiryDate).getTime() < Date.now();
  }

  /* small util */
  id() { return Math.random().toString(36).slice(2, 9); }

}
