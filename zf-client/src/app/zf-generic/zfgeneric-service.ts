import {Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {BehaviorSubject, Observable} from 'rxjs';
import {LoaderService, ZFTypes} from '../loader.service';
import {ZfGenericClass} from './zfgeneric-class';
import {map} from 'rxjs/operators';
import {FieldOptions} from '../helpers/field-options';
import {CONFIRM_MESSAGE_DURATION} from '../constants';
import {ZfGenericFilter} from './zfgeneric-filter';
import {plainToClass} from 'class-transformer';
import {AppStateService, ZFStates} from '../app-state.service';

/**
 * There is a service for every different type of object in the system.
 * Stock, or Transgene or Mutation and there could be more later.
 *
 * All the services are slight variations on a theme. This generic service is the theme.
 *
 * A given extension of the generic service models information displayed in the
 * GUI for one type of object.
 *
 * The data in the model is maintained through communication with the server.
 * The "state" includes -
 * - the currently selected item
 * - a filter object that determines which of the items are in the filtered list
 * - the filtered list itself
 * - array of known values for each of several fields (to facilitate auto completion)
 *
 * The service provides a mechanism for converting received DTOs to actual objects.
 *
 * This service is also provides support for CRUD operations for GUI clients.
 * An important note is that after certain operations (like like creating a object),
 * the other stuff (like the known values for autocomplete options) may also change.
 * So this service is responsible for keeping all of that information in sync.
 *
 * There will be variants for each type of object, but at least we do not triplicate
 * this code (anymore).
 */

@Injectable()
export class ZFGenericService<
  // The SIMPLE_OBJ is a simple version of an object (Transgene, Mutation, Stock)
  // It is SIMPLE because it does not contain related objects.  So, it is used
  // for things like the filteredList.
  SIMPLE_OBJ extends ZfGenericClass,

  // The FULL_OBJ is the full version including some related objects.
  // It is FULL because it *does* (or can) contain related objects.  So, it is used
  // for things like the selectedObject.
  FULL_OBJ extends ZfGenericClass,

  // Note to future self: for Transgenes and Mutations the simple and full classes
  // are the same. For Stocks, they are not even close.

  // The FILTER is a class that specializes in filtering one of the above classes.
  FILTER extends ZfGenericFilter> {

  // Some extensions like transgeneService and mutationService will cache all instances and
  // make them available.  This dummy implementation is for others.
  get all(): ZfGenericClass[] { return []; }

  // This is the currently selected item.
  // It is in focus as far as the GUI is concerned.
  protected _selected$: BehaviorSubject<FULL_OBJ> = new BehaviorSubject<FULL_OBJ>(null);
  get selected$(): BehaviorSubject<FULL_OBJ> { return this._selected$; }
  get selected(): FULL_OBJ { return this.selected$.value; }


  private _filter: FILTER;
  get filter(): FILTER { return this._filter; }

  // private _filteredList$: BehaviorSubject<SIMPLE_OBJ[]> = new BehaviorSubject<SIMPLE_OBJ[]>([]);
  // private get filteredList$(): BehaviorSubject<SIMPLE_OBJ[]> { return this._filteredList$; }
  // get filteredList(): SIMPLE_OBJ[] { return this._filteredList$.value; }
  private _filteredList: SIMPLE_OBJ[] = [];
  get filteredList(): SIMPLE_OBJ[] { return this._filteredList; }

  // The ZF objects usually have a name that is assigned by the the system. The
  // name is sequential and the user does not get to choose it, again usually.
  // So we keep track of what the is the next designated name for the next object.
  // The next name is only "likely" because some other GUI client may grab it
  // first.
  private _likelyNextName$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  get likelyNextName$(): BehaviorSubject<string> { return this._likelyNextName$; }
  get likelyNextName(): string { return this.likelyNextName$.value; }

  protected _fieldOptions: FieldOptions;
  get fieldOptions(): FieldOptions { return this._fieldOptions; }

  constructor(
    // This is very obtuse, so here is what is happening.
    // The generic service is constantly receiving DTOs and converting them
    // to first class objects. BUT you cannot create a generic object like
    // SIMPLE_OBJ with new SIMPLE_OBJ() in the generic.  So instead, you pass in the class
    // as an argument to this constructor and save that class's constructor function.
    // So, ZFSimpleClass and ZFFullClass are functions that are able to create
    // objects of whatever class was passed in.
    // private ZFSimpleClass: { new(DTO): SIMPLE_OBJ ; },
    // private ZFFullClass: { new(DTO): FULL_OBJ ; },
    // private ZFFilterClass: { new(DTO): FILTER ; },

    // this is used to tell the loader what type to use in server calls.
    private zfType: ZFTypes, // stock, mutation or transgene.

    // The loaderService is used in all instances of the generic service
    // but I cannot figure out how to inject it into the generic service.
    // So, instead every instance does the injection and passes it to
    // the generic service in it's super call.
    protected readonly loader: LoaderService,

    // The snackbar is used to give quick progress messages and like the
    // loader, I cannot figure out how to inject one in this generic class.
    protected message: MatSnackBar,

    private appStateService: AppStateService,

  ) {
    // TODO remove following kludge - work required
    if (this.zfType === ZFTypes.TANK) { return; }

    // TODO dont do this if an id is supplied.
    // If no id is supplied default to the one the user was last looking at.
    const storedId  = this.appStateService.getState(zfType, ZFStates.SELECTED_ID);
    if (storedId) {
      this.selectById(storedId);
    }

    // // load filter from local storage or failing that, use an empty one.
    // const storedFilter  = this.appStateService.getState(zfType, ZFStates.FILTER);
    // if (storedFilter) {
    //   this.setFilter(storedFilter);
    // } else {
    //   const filter = plainToClass(this.ZFFilterClass, {});
    //   console.log(zfType + ' empty filter: ' + JSON.stringify(filter));
    //   this.setFilter(filter);
    // }

  }

  // Data comes from the server as a dto, this just converts to the corresponding class
  // Needs to be implemented by inheritors.
  convertSimpleDto2Class(dto): any {
    // return plainToClass(this.ZFSimpleClass, dto);
  }

  // Data comes from the server as a dto, this just converts to the corresponding class
  // Needs to be implemented by inheritors.
  convertFullDto2Class(dto): any {
    // return plainToClass(this.ZFFullClass, dto);
  }

  // load the set of currently known values for some fields
  // These are used primarily for auto-complete fields in the GUI
  loadFieldOptions() {
    this.loader.getFieldOptions(this.zfType).subscribe((data:  {[key: string]: string[]}) => {
      this._fieldOptions.fillFromPlain(data);
    });
  }

  // the selection operation by id.
  // go get the item from the server and select it.
  // A bad id leaves us with nothing selected.
  selectById(id: number) {
    if (id) {
      this.getById(id).subscribe((item: FULL_OBJ) => {
        if (item) {
          this.appStateService.setState(this.zfType, ZFStates.SELECTED_ID, id);
          this.selected$.next(item);
        } else {
          this.appStateService.removeState(this.zfType, ZFStates.SELECTED_ID);
          this.selected$.next(null);
        }
      });
    } else {
      this.appStateService.removeState(this.zfType, ZFStates.SELECTED_ID);
      this.selected$.next(null);
    }
  }

  // fetch an instance from the server.
  getById(id: number): Observable<FULL_OBJ> {
    return this.loader.getInstance(this.zfType, id).pipe(
      map(m => this.convertFullDto2Class(m))
    );
  }

  setFilter(filter: FILTER) {
    this._filter = filter;
    this.appStateService.setState(this.zfType, ZFStates.FILTER, this.filter);
    this.loader.getFilteredList(this.zfType, this.filter)
      .subscribe((dtoList: any[]) => {
        this._filteredList = dtoList.map(item => this.convertSimpleDto2Class(item));
        if (!this.selected && this.filteredList.length > 0) {
          this.selectById(this.filteredList[0].id);
        }
      });
  }

  getLikelyNextName() {
    this.loader.getLikelyNextName(this.zfType).subscribe(data => {
      if (data['name'] !== this.likelyNextName) {
        this.likelyNextName$.next(data['name']);
      }
    });
  }

  update(item: FULL_OBJ) {
    this.loader.update(this.zfType, item).subscribe((result) => {
      if (result.id) {
        this.message.open(this.zfType + ' updated.', null, {duration: CONFIRM_MESSAGE_DURATION});
        this.selectById(result.id);
        this.refresh();
      }
    });
  }

  create(item: FULL_OBJ) {
    this.loader.create(this.zfType, item).subscribe((result) => {
      if (result.id) {
        this.message.open(result.name + ' created.', null, {duration: CONFIRM_MESSAGE_DURATION});
        this.selectById(result.id);
        this.refresh();
      }
    });
  }

  // just like create except it tells the server to use the server assigned name
  // and not some user chosen name
  createNext(item: FULL_OBJ) {
    this.loader.createNext(this.zfType, item).subscribe((result) => {
      if (result.id) {
        this.message.open(result.name + ' created.', null, {duration: CONFIRM_MESSAGE_DURATION});
        this.selectById(item.id);
        this.refresh();
      }
    });
  }


  delete(id: number) {
    this.loader.delete(this.zfType, id).subscribe((result) => {
      if (result) {
        this.message.open(result.name + ' deleted.', null, {duration: CONFIRM_MESSAGE_DURATION});
        this.selectById(0);
        this.refresh();
      }
    });
  }

  // Note: The refresh() is usually extended in services that extend this generic service.
  refresh() {
    this.loadFieldOptions();
    this.getLikelyNextName();
    this.setFilter(this.filter); // reapply the filter to reload the filtered list.
  }
}
