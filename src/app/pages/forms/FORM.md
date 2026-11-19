# Forms in Angular 22

> 📖 **Official docs:** [Forms overview](https://angular.dev/guide/forms)

This folder builds the **same register form three times**, once with each way Angular offers:

| Folder | Kind | Import from | Where the form lives |
|---|---|---|---|
| [`template-form/`](./template-form/TEMPLATE_FORM.md) | Template-driven | `@angular/forms` (`FormsModule`) | In the HTML (`ngModel`, attributes) |
| [`reactive-form/`](./reactive-form/REACTIVE_FORM.md) | Reactive | `@angular/forms` (`ReactiveFormsModule`) | In the TS (`FormGroup` / `FormControl`) |
| [`signal-form/`](./signal-form/SIGNAL_FORM.md) | Signal forms | `@angular/forms/signals` (`FormField`) | In the TS (a `signal` model + a schema function) |

Each folder has its own step-by-step README.

## Which one should I use?

- **Template-driven**: small and simple forms (login, contact, search). Fast to write, but the logic is spread through the HTML and it's harder to test.
- **Reactive**: the classic choice for big or dynamic forms (adding fields at runtime, `FormArray`, cross-field validation). Everything is in the TS and it's easy to unit test.
- **Signal forms**: the new way. The data is a `signal`, validation is a schema function, and errors come with their message. Pick this for new code if you're fine with a newer API.

## Same task, three ways

| Task | Template-driven | Reactive | Signal forms |
|---|---|---|---|
| Import in the component | `FormsModule` | `ReactiveFormsModule` | `FormField` |
| Define the data | plain object `user = {...}` | `fb.group({ name: new FormControl('') })` | `model = signal<T>({...})` |
| Create the form | automatic (`<form #form="ngForm">`) | the `FormGroup` itself | `form(model, schema)` |
| Bind an input | `[(ngModel)]="user.name" name="name"` | `formControlName="name"` | `[formField]="registerForm.name"` |
| Built-in validator | HTML attribute: `required email min="50"` | `Validators.required`, `Validators.email` | `required(field.name)`, `email(field.email)` |
| Custom validator | Directive + `NG_VALIDATORS` | Function returning a `ValidatorFn` | Function calling `validate(path, ...)` |
| Get a field's state | `#name="ngModel"` → `name.invalid` | `form.get('name')?.invalid` | `registerForm.name().invalid()` |
| Error message | written in the HTML | written in the HTML | comes from the validator (`error.message`) |
| Read the values | `this.user` | `this.form.value` | `this.registerForm().value()` / `this.model()` |
| Submit | `(ngSubmit)="onSubmit(form)"` | `(ngSubmit)="onSubmit()"` | `(submit)="onSubmit($event)"` + `preventDefault()` |
| Show all errors | `form.control.markAllAsTouched()` | `form.markAllAsTouched()` | `field().markAsTouched()` |
| Reset | `form.resetForm()` | `form.reset()` | `model.set(initial)` + `registerForm().reset()` |

## Shared files used by the three forms

- `core/requests/register.request.ts`: `RegisterRequest`, the shape of the data the forms send (`birthdate` is a `'YYYY-MM-DD'` string)
- `core/interfaces/user.interface.ts`: `UserInterface`, the user as the app uses it (`birthdate` is a `Date`)
- `core/responses/user.response.ts`: `UserResponse`, the user as the API sends it back (no password)
- `core/enums/gender.enum.ts`: `GenderEnum` (`male`, `female`, `other`)
- `core/enums/subscription.enum.ts`: `SubscriptionEnum` (`free`, `premium`)
- `core/validators/<kind>/`: the custom validators, one folder per kind of form (`reactive-form/`, `template-form/`, `signal-form/`)

## Routing

The forms are lazy-loaded in `form.routes.ts` with `loadComponent`:

```ts
{
  path: 'reactive-form',
  loadComponent: () =>
    import('./reactive-form/reactive-form.component').then((m) => m.ReactiveFormComponent),
},
```
