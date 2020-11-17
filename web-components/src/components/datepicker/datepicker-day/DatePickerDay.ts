import "@/components/button/Button";
import { DatePickerProps, DayFilters, getDate, isDayDisabled, isSameDay, now } from "@/utils/dateUtils";
import reset from "@/wc_scss/reset.scss";
import { customElement, html, internalProperty, LitElement, property, PropertyValues } from "lit-element";
import { classMap } from "lit-html/directives/class-map";
import { ifDefined } from "lit-html/directives/if-defined";
import { DateTime } from "luxon/index";
import styles from "../scss/module.scss";

@customElement("md-datepicker-day")
export class DatePickerDay extends LitElement {
  @property({ type: Boolean, reflect: true }) focused = false;
  @property({ type: Boolean, reflect: true }) selected = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ attribute: false }) day: DateTime = now();
  @property({ attribute: false }) viewAnchorMonth: number | undefined = undefined;
  @property({ attribute: false }) handleDayClick: Function | undefined = undefined; // REFACTOR: Why pass all the way here? Just listen for custom even at Top level
  @property({ attribute: false }) filterParams: DayFilters | null = null;
  @property({ attribute: false }) datePickerProps: DatePickerProps | undefined = undefined;

  @internalProperty() protected isOutsideMonth = false;
  @internalProperty() protected isToday = false;

  connectedCallback() {
    super.connectedCallback();
    this.disabled = this.filterParams && isDayDisabled(this.day, this.filterParams) ? true : false;
    this.isOutsideMonth = this.day.month !== this.viewAnchorMonth;
    this.isToday = isSameDay(this.day, now());
    this.selected = (this.datePickerProps && isSameDay(this.datePickerProps.selected, this.day)) || false;
    this.focused = (this.datePickerProps && isSameDay(this.datePickerProps.focused, this.day)) || false;
  }

  updated(changedProperties: PropertyValues) {
    console.log(this.datePickerProps?.selected);
    super.updated(changedProperties);
    this.isOutsideMonth = this.day.month !== this.viewAnchorMonth;
    this.isToday = isSameDay(this.day, now());
    this.selected = (this.datePickerProps && isSameDay(this.datePickerProps.selected, this.day)) || false;
    this.focused = (this.datePickerProps && isSameDay(this.datePickerProps.focused, this.day)) || false;
  }

  handleClick = (e: MouseEvent) => {
    const { handleDayClick, day } = this;
    handleDayClick && handleDayClick(e, day);

    this.dispatchEvent(
      new CustomEvent("day-select", {
        bubbles: true,
        composed: true,
        detail: {
          date: this.day,
          sourceEvent: e
        }
      })
    );
  };

  handleKey = (e: KeyboardEvent) => {
    this.dispatchEvent(
      new CustomEvent("day-key-event", {
        bubbles: true,
        composed: true,
        detail: {
          sourceEvent: e
        }
      })
    );
  };

  static get styles() {
    return [reset, styles];
  }

  render() {
    const dayClassMap = {
      "md-datepicker__day--selected": this.selected,
      "md-datepicker__day--focus": this.focused,
      "md-datepicker__day--today": this.isToday,
      "md-datepicker__day--outside-month": this.isOutsideMonth
    };

    return html`
      <md-button
        circle
        size=${28}
        color=${"color-none"}
        ?disabled=${this.disabled}
        class="md-datepicker__day ${classMap(dayClassMap)}"
        @click=${(e: MouseEvent) => {
          !this.disabled && this.handleClick(e);
        }}
        @keydown=${(e: KeyboardEvent) => this.handleKey(e)}
        aria-label=${`${this.day?.toFormat("D, dd MMMM yyyy")}`}
        aria-selected=${ifDefined(this.selected)}
        tab-index=${0}
      >
        ${this.day && getDate(this.day)}
      </md-button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "md-datepicker-day": DatePickerDay;
  }
}
