import { Routes } from '@angular/router';
import { Landingscreen } from './landingscreen/landingscreen'; // your sidenav layout
import { Sidenav } from './sidenav/sidenav'; // your sidenav layout
import { Dashboard } from './dashboard/dashboard'; // example routed component
import { Customeronboard } from './customeronboard/customeronboard'; // example routed component
import { CustomerOnboarding } from './customer-onboarding/customer-onboarding'; // example routed component
import { LoginModule } from './login-module/login-module'; // example routed component
import { LoginForm } from './login-form/login-form'; // example routed component
import { BillingPaymentsComponent } from './billing-payments/billing-payments';
import { Documents } from './documents/documents';
import { Settings } from './settings/settings';

export const routes: Routes = [
    { path: '', component: LoginModule },
    { path: 'LoginModules', component: LoginModule },

    { path: 'Landingscreen', component: Landingscreen },
    
    { path: 'Landingscreen/CustomerOnboarding/newCustomer', component: CustomerOnboarding },


    // {
    //     path: 'Landingscreen/CustomerOnboarding',
    //     component: Sidenav,
    //     children: [
    //         { path: 'newCustomer', component: CustomerOnboarding },
    //         { path: '', redirectTo: 'newCustomer', pathMatch: 'full' }
    //     ]
    // },
    {
        path: 'Landingscreen/Sidenav',
        component: Sidenav,
        children: [
            { path: 'page/1', component: Dashboard },
            { path: 'page/2', component: Customeronboard },
            { path: 'page/3', component: CustomerOnboarding },
            { path: 'page/4', component: BillingPaymentsComponent },
            { path: 'page/5', component: Documents },
            { path: 'page/8', component: Settings },
            { path: '', redirectTo: 'page/1', pathMatch: 'full' }, // default child
        ]
    },

    { path: '**', redirectTo: '' }
];

