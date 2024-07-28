'use strict';
class Component {
    anchor; // DOM-Element, in das ich mich einhänge
    parent; // Component
    children; // Component[]
    domElement; // wird in child-klasse mit document.createElement selbst erzeugt
    isADomChild; // boolean

    constructor(parent, anchor) {
        // parent has .domElement
        if (anchor == undefined) {
            this.anchor = parent.domElement;
        } else {
            this.anchor = anchor;
        }
        this.parent = parent;
        this.children = [];
        this.isADomChild = false;
    }

    delete() {
        // tell the parent: remove me
        this.parent.remove(this);
    }
    remove(child) {
        // WARN not usable in a loop
        // 1. from domElement
        child.removeFromDom();
        // 2. from children array
        let index = this.children.indexOf(child);
        if (index > -1) {
            this.children.splice(index, 1); // 1 -> deleteCount
        }
    }
    display() {
        this.domElement.hidden = false;
    }
    hide() {
        this.domElement.hidden = true;
    }
    addToDom(elem) {
        if (!elem) {
            throw new Error('Component.addToDom: no elem');
        }
        this.domElement = elem;
        this.anchor.appendChild(elem);
        this.isADomChild = true;
    }
    removeFromDom() {
        if (this.isADomChild) {
            this.anchor.removeChild(this.domElement);
            this.isADomChild = false;
        } else {
            console.warn('Component.removeFromDom: was not a dom child:');
            console.warn(this.domElement);
        }
    }

    setDirty(dirty = true) {
        this.dirty = dirty;
    }
}
// export { Component };
