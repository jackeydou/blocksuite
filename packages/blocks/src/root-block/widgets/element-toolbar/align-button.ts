import '../../edgeless/components/buttons/tool-icon-button.js';
import '../../edgeless/components/buttons/menu-button.js';

import { WithDisposable } from '@blocksuite/block-std';
import { html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import {
  AlignBottomIcon,
  AlignDistributeHorizontallyIcon,
  AlignDistributeVerticallyIcon,
  AlignHorizontallyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  AlignTopIcon,
  AlignVerticallyIcon,
  SmallArrowDownIcon,
} from '../../../_common/icons/index.js';
import type { EdgelessModel } from '../../../_common/utils/index.js';
import {
  Bound,
  ConnectorElementModel,
  GroupElementModel,
  MindmapElementModel,
} from '../../../surface-block/index.js';
import type { EdgelessRootBlockComponent } from '../../edgeless/edgeless-root-block.js';

@customElement('edgeless-align-button')
export class EdgelessAlignButton extends WithDisposable(LitElement) {
  @property({ attribute: false })
  edgeless!: EdgelessRootBlockComponent;

  private get elements() {
    return this.edgeless.service.selection.elements;
  }

  override firstUpdated() {
    this._disposables.add(
      this.edgeless.service.selection.slots.updated.on(() =>
        this.requestUpdate()
      )
    );
  }

  private _updateXYWH(ele: EdgelessModel, bound: Bound) {
    if (ele instanceof ConnectorElementModel) {
      ele.moveTo(bound);
    } else if (ele instanceof GroupElementModel) {
      const groupBound = Bound.deserialize(ele.xywh);
      ele.childElements.forEach(child => {
        const newBound = Bound.deserialize(child.xywh);
        newBound.x += bound.x - groupBound.x;
        newBound.y += bound.y - groupBound.y;
        this._updateXYWH(child, newBound);
      });
    } else {
      this.edgeless.service.updateElement(ele.id, {
        xywh: bound.serialize(),
      });
    }
  }

  private _alignLeft() {
    const { elements } = this;
    const bounds = elements.map(a => a.elementBound);
    const left = Math.min(...bounds.map(b => b.minX));

    elements.forEach((ele, index) => {
      const elementBound = bounds[index];
      const bound = Bound.deserialize(ele.xywh);
      const offset = bound.minX - elementBound.minX;
      bound.x = left + offset;
      this._updateXYWH(ele, bound);
    });
  }

  private _alignRight() {
    const { elements } = this;
    const bounds = elements.map(a => a.elementBound);
    const right = Math.max(...bounds.map(b => b.maxX));

    elements.forEach((ele, index) => {
      const elementBound = bounds[index];
      const bound = Bound.deserialize(ele.xywh);
      const offset = bound.maxX - elementBound.maxX;
      bound.x = right - bound.w + offset;
      this._updateXYWH(ele, bound);
    });
  }

  private _alignHorizontally() {
    const { elements } = this;
    const bounds = elements.map(a => a.elementBound);
    const left = Math.min(...bounds.map(b => b.minX));
    const right = Math.max(...bounds.map(b => b.maxX));
    const centerX = (left + right) / 2;

    elements.forEach(ele => {
      const bound = Bound.deserialize(ele.xywh);
      bound.x = centerX - bound.w / 2;
      this._updateXYWH(ele, bound);
    });
  }

  private _alignDistributeHorizontally() {
    const { elements } = this;

    elements.sort((a, b) => a.elementBound.minX - b.elementBound.minX);
    const bounds = elements.map(a => a.elementBound);
    const left = bounds[0].minX;
    const right = bounds[bounds.length - 1].maxX;

    const totalWidth = right - left;
    const totalGap =
      totalWidth - elements.reduce((prev, ele) => prev + ele.elementBound.w, 0);
    const gap = totalGap / (elements.length - 1);
    let next = bounds[0].maxX + gap;
    for (let i = 1; i < elements.length - 1; i++) {
      const bound = Bound.deserialize(elements[i].xywh);
      bound.x = next + bounds[i].w / 2 - bound.w / 2;
      next += gap + bounds[i].w;
      this._updateXYWH(elements[i], bound);
    }
  }

  private _alignTop() {
    const { elements } = this;
    const bounds = elements.map(a => a.elementBound);
    const top = Math.min(...bounds.map(b => b.minY));

    elements.forEach((ele, index) => {
      const elementBound = bounds[index];
      const bound = Bound.deserialize(ele.xywh);
      const offset = bound.minY - elementBound.minY;
      bound.y = top + offset;
      this._updateXYWH(ele, bound);
    });
  }

  private _alignBottom() {
    const { elements } = this;
    const bounds = elements.map(a => a.elementBound);
    const bottom = Math.max(...bounds.map(b => b.maxY));

    elements.forEach((ele, index) => {
      const elementBound = bounds[index];
      const bound = Bound.deserialize(ele.xywh);
      const offset = bound.maxY - elementBound.maxY;
      bound.y = bottom - bound.h + offset;
      this._updateXYWH(ele, bound);
    });
  }

  private _alignVertically() {
    const { elements } = this;
    const bounds = elements.map(a => a.elementBound);
    const top = Math.min(...bounds.map(b => b.minY));
    const bottom = Math.max(...bounds.map(b => b.maxY));
    const centerY = (top + bottom) / 2;

    elements.forEach(ele => {
      const bound = Bound.deserialize(ele.xywh);
      bound.y = centerY - bound.h / 2;
      this._updateXYWH(ele, bound);
    });
  }

  private _alignDistributeVertically() {
    const { elements } = this;

    elements.sort((a, b) => a.elementBound.minY - b.elementBound.minY);
    const bounds = elements.map(a => a.elementBound);
    const top = bounds[0].minY;
    const bottom = bounds[bounds.length - 1].maxY;

    const totalHeight = bottom - top;
    const totalGap =
      totalHeight -
      elements.reduce((prev, ele) => prev + ele.elementBound.h, 0);
    const gap = totalGap / (elements.length - 1);
    let next = bounds[0].maxY + gap;
    for (let i = 1; i < elements.length - 1; i++) {
      const bound = Bound.deserialize(elements[i].xywh);
      bound.y = next + bounds[i].h / 2 - bound.h / 2;
      next += gap + bounds[i].h;
      this._updateXYWH(elements[i], bound);
    }
  }

  override render() {
    return html`<edgeless-menu-button
      .button=${html`<edgeless-tool-icon-button
        aria-label="Align objects"
        .tooltip=${'Align objects'}
      >
        ${AlignLeftIcon}${SmallArrowDownIcon}
      </edgeless-tool-icon-button>`}
    >
      <div slot data-orientation="horizontal">
        <edgeless-tool-icon-button
          .tooltip=${'Align left'}
          @click=${() => this._alignLeft()}
        >
          ${AlignLeftIcon}
        </edgeless-tool-icon-button>
        <edgeless-tool-icon-button
          .tooltip=${'Align horizontally'}
          @click=${() => this._alignHorizontally()}
        >
          ${AlignHorizontallyIcon}
        </edgeless-tool-icon-button>

        <edgeless-tool-icon-button
          .tooltip=${'Align right'}
          @click=${() => this._alignRight()}
        >
          ${AlignRightIcon}
        </edgeless-tool-icon-button>
        <edgeless-tool-icon-button
          .tooltip=${'Distribute horizontally'}
          .disabled=${this.elements.length < 3}
          @click=${() => this._alignDistributeHorizontally()}
        >
          ${AlignDistributeHorizontallyIcon}
        </edgeless-tool-icon-button>

        <edgeless-menu-divider></edgeless-menu-divider>

        <edgeless-tool-icon-button
          .tooltip=${'Align top'}
          @click=${() => this._alignTop()}
        >
          ${AlignTopIcon}
        </edgeless-tool-icon-button>
        <edgeless-tool-icon-button
          .tooltip=${'Align vertically'}
          @click=${() => this._alignVertically()}
        >
          ${AlignVerticallyIcon}
        </edgeless-tool-icon-button>

        <edgeless-tool-icon-button
          .tooltip=${'Align bottom'}
          @click=${() => this._alignBottom()}
        >
          ${AlignBottomIcon}
        </edgeless-tool-icon-button>
        <edgeless-tool-icon-button
          .tooltip=${'Distribute vertically'}
          .disabled=${this.elements.length < 3}
          @click=${() => this._alignDistributeVertically()}
        >
          ${AlignDistributeVerticallyIcon}
        </edgeless-tool-icon-button>
      </div>
    </edgeless-menu-button>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'edgeless-align-button': EdgelessAlignButton;
  }
}

export function renderAlignButton(
  edgeless: EdgelessRootBlockComponent,
  elements: EdgelessModel[]
) {
  if (elements.length < 2) return nothing;
  if (elements.some(e => e.group instanceof MindmapElementModel))
    return nothing;

  return html`<edgeless-align-button
    .edgeless=${edgeless}
  ></edgeless-align-button>`;
}
