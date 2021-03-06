import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BookService } from 'src/app/core/services/book/book.service';
import { LocalDataSource } from 'ng2-smart-table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DonateComponent } from '../donate/donate.component';

@Component({
  selector: 'app-donate-page',
  templateUrl: './donate-page.component.html',
  styleUrls: ['./donate-page.component.css']
})
export class DonatePageComponent implements OnInit, OnDestroy {
  donateUsers: LocalDataSource;
  isLoading: Boolean = true;
  settings: any;
  returnUrl: string;
  selectedDonatedUser: any;
  showNote: Boolean = false;
  formGroup: FormGroup;
  bookId: string;

  private _destroySubscribes$ = new Subject<void>();

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _scBook: BookService,
    private _modalService: NgbModal,
    private _formBuilder: FormBuilder
  ) {
    this.formGroup = _formBuilder.group({
      myNote: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this._activatedRoute.params
    .pipe(
      takeUntil(this._destroySubscribes$)
    )
    .subscribe(param => (this.bookId = param.id));

    this.returnUrl = this._activatedRoute.snapshot.queryParams['returnUrl'] || '/panel';

    this._scBook.getRequestersList(this.bookId)
    .pipe(
      takeUntil(this._destroySubscribes$)
    )
    .subscribe(resp => {
      this.donateUsers = new LocalDataSource(<any>resp);
      this.isLoading = false;
    });

    const btnDonate =
      '<span class="btn btn-warning btn-sm ml-1 mb-1" data-toggle="tooltip" title="Escolher Donatário">' +
      ' <i class="fa fa-trophy"></i> </span>';

    this.settings = {
      mode: 'inline',
      hideSubHeader: true,
      columns: {
        requesterNickName: {
          title: 'Apelido',
          filter: false,
          width: '15%'
        },
        location: {
          title: 'Destino',
          filter: false,
          width: '15%'
        },
        totalBooksWon: {
          title: 'Livros Ganhos',
          filter: false,
          width: '5%'
        },
        totalBooksDonated: {
          title: 'Livros Doados',
          filter: false,
          width: '5%'
        },
        requestText: {
          title: 'Motivo',
          filter: false,
          width: '40%'
        }
      },
      actions: {
        delete: false,
        edit: false,
        add: false,
        update: false,
        custom: [
          {
            name: 'donate',
            title: btnDonate
          }
        ],
        position: 'right' // left|right
      }
    };
  }

  onCustom(event) {
    if (event.action === 'donate') {
      const modalRef = this._modalService.open(DonateComponent, {
        backdropClass: 'light-blue-backdrop',
        centered: true
      });
      modalRef.componentInstance.bookId = this.bookId;
      modalRef.componentInstance.userId = event.data.userId;
      modalRef.componentInstance.userNickName = event.data.requesterNickName;

      modalRef.result.then(data => {
        if (data === 'ok') {
          this.back();
        }
      });
    }
  }

  back() {
    this._router.navigate([this.returnUrl]);
  }

  ngOnDestroy() {
    this._destroySubscribes$.next();
    this._destroySubscribes$.complete();
  }
}
