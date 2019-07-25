import { ViewChild, AfterViewInit, ElementRef, Input, Directive, Component, TemplateRef, ContentChildren, QueryList, ViewChildren } from '@angular/core';
import { AnimationPlayer, AnimationBuilder, style, AnimationFactory, animate } from '@angular/animations';

// https://stackblitz.com/edit/angular-carousel-component

@Directive({
  selector: '[carouselItem]'
})
export class CarouselItemDirective {
  constructor( public tpl : TemplateRef<any> ) {
  }
}

@Directive({
  selector: '.carousel-item'
})
export class CarouselItemElement {
}

@Component({
  selector: 'carousel',
  exportAs: 'carousel',
  template: `
    <section class="carousel-wrapper" [ngStyle]="carouselWrapperStyle">
      <ul class="carousel-inner" #carousel>
        <li *ngFor="let item of items;" class="carousel-item">
          <ng-container [ngTemplateOutlet]="item.tpl"></ng-container>
        </li>
      </ul>
    </section>
  `,
  styles: [`
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    width: 6000px;
  }
  .carousel-wrapper {
    overflow: hidden;
  }
  .carousel-inner {
    display: flex;
  }
`]
})
export class CarouselComponent implements AfterViewInit {

  @ContentChildren(CarouselItemDirective) items : QueryList<CarouselItemDirective>;
  @ViewChildren(CarouselItemElement, { read: ElementRef }) private itemsElements : QueryList<ElementRef>;
  @ViewChild('carousel') private carousel : ElementRef;
  @Input() timing = '250ms ease-in';
  @Input() showControls = true;
  private player : AnimationPlayer;
  private itemWidth : number;
  private currentSlide = 0;
  carouselWrapperStyle = {}

  constructor( private builder : AnimationBuilder ) {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.itemWidth = this.itemsElements.first.nativeElement.getBoundingClientRect().width;
      this.carouselWrapperStyle = {
        width: `${this.itemWidth}px`
      }
    });
    setInterval(() => {
      this.next();
    }, 1000);
  }
  
  next() {
    this.currentSlide = (this.currentSlide + 1) % this.items.length;

    const offset = this.currentSlide * this.itemWidth;

    const myAnimation : AnimationFactory = this.builder.build([
       animate(this.timing, style({ transform: `translateX(-${offset}px)` }))
    ]);

    this.player = myAnimation.create(this.carousel.nativeElement);
    this.player.play();
  }

  private buildAnimation( offset ) {
    return this.builder.build([
      animate(this.timing, style({ transform: `translateX(-${offset}px)` }))
    ]);
  }

  prev() {
    if( this.currentSlide === 0 ) return;
 
     this.currentSlide = ((this.currentSlide - 1) + this.items.length) % this.items.length;
     const offset = this.currentSlide * this.itemWidth;
 
     const myAnimation : AnimationFactory = this.builder.build([
       animate(this.timing, style({ transform: `translateX(-${offset}px)` }))
     ]);
 
     this.player = myAnimation.create(this.carousel.nativeElement);
     this.player.play();
   }
}