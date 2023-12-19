'use strict';
// Rules
//
// For a space that is populated:
//     Each cell with one or no neighbors dies, as if by solitude.
//     Each cell with four or more neighbors dies, as if by overpopulation.
//     Each cell with two or three neighbors survives.
// For a space that is empty or unpopulated:
//     Each cell with three neighbors becomes populated.
// import { Component } from './component.js';
class Grid extends Component {
    columns;
    rows;
    cells;
    intervallId;
    constructor(parent, anchor, columns, rows) {
        super(parent, anchor);
        this.columns = columns;
        this.rows = rows;
        this.addToDom(document.createElement('section'));
        this.domElement.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        this.domElement.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        this.domElement.style.display = 'grid';
        this.domElement.id = 'grid';
        this.cells = {}; // {row: {column: cell}}
        // Es werden hier nur mehr die dom Elemente erstellt.
        for (let row = 0; row < rows; row++) {
            for (let column = 0; column < columns; column++) {
                const cell = document.createElement('div');
                cell.setAttribute('data-row', row);
                cell.setAttribute('data-column', column);
                this.domElement.appendChild(cell);
                cell.addEventListener('click', (e) => {
                    this.toggleLiving(row, column);
                });
            }
        }
    }
    toggleLiving(row, column) {
        this.getCell(row, column).toggleLiving();
    }
    // creates a cell "on demand"
    getCell(row, column, obj = this.cells) {
        if (!obj.hasOwnProperty(row)) {
            obj[row] = {};
        }
        if (!obj[row].hasOwnProperty(column)) {
            obj[row][column] = new Cell(row, column, this);
        }
        return obj[row][column];
    }
    // unordered
    *cellIterator() {
        for (let row in this.cells) {
            for (let column in this.cells[row]) {
                yield this.cells[row][column];
            }
        }
    }
    ageOneGeneration() {
        // 1. calculate Future for all living cells
        // after 1: neighbor cells have been instantiated
        // 2. calculate Future for all freshly created neighbor cells
        // 3. update Display for all cells in relevantCellsNow
        // 4. transfer all living cells to a new Obj
        // 5. replace relevantCellsNow with new Obj
        [...this.cellIterator()].forEach((cell) => {
            cell.calculateLivingThen();
        }); // 1.
        [...this.cellIterator()].forEach((cell) => {
            cell.livingThen ?? cell.calculateLivingThen();
        }); // 2. (handles undefined vs. false)
        [...this.cellIterator()].forEach((cell) => {
            cell.advanceToNextGeneration();
        }); // 3.
        const futureCells = {};
        [...this.cellIterator()].forEach((cell) => {
            if (cell.living) {
                this.getCell(cell.row, cell.column, futureCells).setLiving();
            }
        }); // 4.
        this.cells = futureCells; // 5.
    }
    shift(arg) {
        const factor = -5;
        let offsetRow = 0;
        let offsetColumn = 0;
        switch (arg) {
            case 'left':
                offsetColumn = -1;
                break;
            case 'right':
                offsetColumn = 1;
                break;
            case 'up':
                offsetRow = -1;
                break;
            case 'down':
                offsetRow = 1;
                break;
            default:
                console.warn('Grid.shift: unknown direction: ' + arg);
        }
        offsetRow *= factor;
        offsetColumn *= factor;
        const futureCells = {};
        [...this.cellIterator()].forEach((cell) => {
            this.getCell(
                cell.row + offsetRow,
                cell.column + offsetColumn,
                futureCells
            ).setLiving();
            cell.setLiving(false);
        });
        this.cells = futureCells;
        [...this.cellIterator()].forEach((_) => _.updateDisplay());
    }
    getGoing(ms = 250) {
        if (!(this.intervallId === undefined)) {
            console.warn('Grid.getGoing: already going');
            return;
        }
        this.intervallId = setInterval(() => {
            this.ageOneGeneration();
        }, ms);
    }
    pause() {
        clearInterval(this.intervallId);
        this.intervallId = undefined;
    }
    setPattern(pattern) {
        switch (pattern) {
            case 'glider':
                this.getCell(2, 3).setLiving(true);
                this.getCell(3, 4).setLiving(true);
                this.getCell(4, 2).setLiving(true);
                this.getCell(4, 3).setLiving(true);
                this.getCell(4, 4).setLiving(true);
                break;
            case 'blinker':
                this.getCell(2, 3).setLiving(true);
                this.getCell(3, 3).setLiving(true);
                this.getCell(4, 3).setLiving(true);
                break;
            case 'beacon':
                this.getCell(2, 2).setLiving(true);
                this.getCell(2, 3).setLiving(true);
                this.getCell(3, 2).setLiving(true);
                this.getCell(3, 3).setLiving(true);
                this.getCell(4, 4).setLiving(true);
                this.getCell(4, 5).setLiving(true);
                this.getCell(5, 4).setLiving(true);
                this.getCell(5, 5).setLiving(true);
                break;
            case 'toad':
                this.getCell(2, 3).setLiving(true);
                this.getCell(2, 4).setLiving(true);
                this.getCell(2, 5).setLiving(true);
                this.getCell(3, 2).setLiving(true);
                this.getCell(3, 3).setLiving(true);
                this.getCell(3, 4).setLiving(true);
                break;
            case 'pulsar':
                this.getCell(2, 4).setLiving(true);
                this.getCell(2, 5).setLiving(true);
                this.getCell(2, 6).setLiving(true);
                this.getCell(2, 10).setLiving(true);
                this.getCell(2, 11).setLiving(true);
                this.getCell(2, 12).setLiving(true);
                this.getCell(4, 2).setLiving(true);
                this.getCell(4, 7).setLiving(true);
                this.getCell(4, 9).setLiving(true);
                this.getCell(4, 14).setLiving(true);
                this.getCell(5, 2).setLiving(true);
                this.getCell(5, 7).setLiving(true);
                this.getCell(5, 9).setLiving(true);
                this.getCell(5, 14).setLiving(true);
                this.getCell(6, 2).setLiving(true);
                this.getCell(6, 7).setLiving(true);
                this.getCell(6, 9).setLiving(true);
                this.getCell(6, 14).setLiving(true);
                this.getCell(7, 4).setLiving(true);
                this.getCell(7, 5).setLiving(true);
                this.getCell(7, 6).setLiving(true);
                this.getCell(7, 10).setLiving(true);
                this.getCell(7, 11).setLiving(true);
                this.getCell(7, 12).setLiving(true);
                this.getCell(9, 4).setLiving(true);
                this.getCell(9, 5).setLiving(true);
                this.getCell(9, 6).setLiving(true);
                this.getCell(9, 10).setLiving(true);
                this.getCell(9, 11).setLiving(true);
                this.getCell(9, 12).setLiving(true);
                this.getCell(10, 2).setLiving(true);
                this.getCell(10, 7).setLiving(true);
                this.getCell(10, 9).setLiving(true);
                this.getCell(10, 14).setLiving(true);
                this.getCell(11, 2).setLiving(true);
                this.getCell(11, 7).setLiving(true);
                this.getCell(11, 9).setLiving(true);
                this.getCell(11, 14).setLiving(true);
                this.getCell(12, 2).setLiving(true);
                this.getCell(12, 7).setLiving(true);
                this.getCell(12, 9).setLiving(true);
                this.getCell(12, 14).setLiving(true);
                this.getCell(14, 4).setLiving(true);
                this.getCell(14, 5).setLiving(true);
                this.getCell(14, 6).setLiving(true);
                this.getCell(14, 10).setLiving(true);
                this.getCell(14, 11).setLiving(true);
                this.getCell(14, 12).setLiving(true);
                break;
            default:
                console.warn('Grid.setPattern: unknown pattern: ' + pattern);
        }
    }
}

class Cell {
    row;
    column;
    living; // boolean
    livingThen; // boolean
    constructor(row, column, grid) {
        this.row = row;
        this.column = column;
        this.grid = grid;
        this.living = false;
        this.livingThen = undefined;
    }
    calculateLivingThen() {
        // actually John Conways Game has an infinite grid,
        // so we implement that
        let rowStart = this.row - 1;
        let rowEnd = this.row + 1;
        let columnStart = this.column - 1;
        let columnEnd = this.column + 1;
        let livingNeighbors = 0;
        for (let row = rowStart; row <= rowEnd; row++) {
            for (let column = columnStart; column <= columnEnd; column++) {
                if (row == this.row && column == this.column) {
                    continue; // skip self
                }
                if (this.grid.getCell(row, column).living) livingNeighbors++;
            }
        }
        if (this.living) {
            if (livingNeighbors < 2 || livingNeighbors > 3) {
                // solitude || overpopulation
                this.livingThen = false;
                return;
            }
        } else {
            // dead
            if (livingNeighbors == 3) {
                this.livingThen = true;
                return;
            }
        }
        this.livingThen = this.living;
    }
    setLiving(alive = true) {
        this.living = alive;
        this.livingThen = undefined;
        this.updateDisplay();
    }
    toggleLiving() {
        this.setLiving(!this.living);
    }
    updateDisplay() {
        const cell = document.querySelector(
            `div[data-row="${this.row}"][data-column="${this.column}"]`
        );
        if (!cell) {
            return;
        }
        if (this.living) {
            cell.classList.add('living');
        } else {
            cell.classList.remove('living');
        }
    }
    advanceToNextGeneration() {
        this.livingThen ??= false; // newly generated in 2nd step
        this.living = this.livingThen;
        this.livingThen = undefined;
        this.updateDisplay();
    }
}

const sectionGrid = document.querySelector('main');
const grid = new Grid(null, sectionGrid, 50, 50);
console.log(grid);

const resetButton = document.querySelector('button#reset');
resetButton.addEventListener('click', () => {
    grid.pause();
    [...grid.cellIterator()].forEach((cell) => {
        cell.setLiving(false);
    });
});
const goButton = document.querySelector('button#go');
goButton.addEventListener('click', () => {
    grid.getGoing();
});
const stopButton = document.querySelector('button#stop');
stopButton.addEventListener('click', () => {
    grid.pause();
});
const formSelector = document.querySelector('select#form');
formSelector.addEventListener('change', (e) => {
    grid.setPattern(e.target.value);
    e.target.value = '-- select --';
});

const shiftLeftButton = document.querySelector('button#left');
shiftLeftButton.addEventListener('click', () => {
    grid.shift('left');
});
const shiftRightButton = document.querySelector('button#right');
shiftRightButton.addEventListener('click', () => {
    grid.shift('right');
});
const shiftUpButton = document.querySelector('button#up');
shiftUpButton.addEventListener('click', () => {
    grid.shift('up');
});
const shiftDownButton = document.querySelector('button#down');
shiftDownButton.addEventListener('click', () => {
    grid.shift('down');
});
