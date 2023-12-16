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
    cells; // Cell[][]
    intervallId;
    constructor(parent, anchor, columns, rows) {
        super(parent, anchor);
        this.columns = columns;
        this.rows = rows;
        this.domElement = document.createElement('section');
        this.addToDom();
        this.domElement.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        this.domElement.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        this.domElement.style.display = 'grid';
        this.domElement.id = 'grid';
        this.cells = [];
        for (let row = 0; row < rows; row++) {
            this.cells[row] = [];
            for (let column = 0; column < columns; column++) {
                let cell = new Cell(this, this.domElement, row + 1, column + 1);
                this.cells[row][column] = cell;
            }
        }
    }
    getCell(row, column) {
        return this.cells[row - 1][column - 1];
    }
    calculateFuture() {
        for (let row = 0; row < this.rows; row++) {
            for (let column = 0; column < this.columns; column++) {
                this.cells[row][column].calculateFuture();
            }
        }
    }
    advanceToNextGeneration() {
        for (let row = 0; row < this.rows; row++) {
            for (let column = 0; column < this.columns; column++) {
                this.cells[row][column].advanceToNextGeneration();
            }
        }
    }
    ageOneGeneration() {
        this.calculateFuture();
        this.advanceToNextGeneration();
    }
    getGoing(ms) {
        this.intervallId = setInterval(() => {
            this.ageOneGeneration();
        }, ms);
    }
    pause() {
        clearInterval(this.intervallId);
    }
    setPattern(pattern) {
        if (pattern == 'glider') {
            this.getCell(2, 3).setLiving(true);
            this.getCell(3, 4).setLiving(true);
            this.getCell(4, 2).setLiving(true);
            this.getCell(4, 3).setLiving(true);
            this.getCell(4, 4).setLiving(true);
        }
    }
}

class Cell extends Component {
    row;
    column;
    grid;
    living; // boolean
    livingThen; // boolean
    constructor(grid, parentDom, row, column) {
        super(grid, parentDom);
        this.row = row;
        this.column = column;
        this.grid = grid;
        this.living = false;
        this.domElement = document.createElement('div');
        this.domElement.obj = this;
        this.domElement.addEventListener('click', () => {
            this.toggleLiving();
        });
        this.addToDom();
    }
    calculateFuture() {
        // actually John Conwyas Game has an infinite grid, but we have a finite one
        let rowStart = this.row - 1;
        if (rowStart < 1) rowStart = 1;
        let rowEnd = this.row + 1;
        if (rowEnd > this.grid.rows) rowEnd = this.grid.rows;
        let columnStart = this.column - 1;
        if (columnStart < 1) columnStart = 1;
        let columnEnd = this.column + 1;
        if (columnEnd > this.grid.columns) columnEnd = this.grid.columns;
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
            if (livingNeighbors < 2) {
                // solitude
                this.livingThen = false;
                return;
            }
            if (livingNeighbors > 3) {
                // overpopulation
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
    setLiving(alive) {
        this.living = alive;
        this.livingThen = undefined;
        this.updateDisplay();
    }
    toggleLiving() {
        this.setLiving(!this.living);
    }
    updateDisplay() {
        if (this.living) {
            this.domElement.classList.add('living');
        } else {
            this.domElement.classList.remove('living');
        }
    }
    advanceToNextGeneration() {
        if (this.livingThen == undefined) {
            throw 'Cell.advanceToNextGeneration() called before Cell.calculateFuture()';
        }
        this.living = this.livingThen;
        this.livingThen = undefined;
        this.updateDisplay();
    }
}

const sectionGrid = document.querySelector('main');
const grid = new Grid(null, sectionGrid, 50, 50);
console.log(grid);
const mycell = grid.getCell(grid.rows, grid.columns);
