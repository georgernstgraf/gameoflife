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
    relevantCellsNow;
    relevantCellsFuture;
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
                let cell = new Cell(this, this.domElement, row, column);
                this.cells[row][column] = cell;
            }
        }
        this.relevantCellsNow = {}; // {row: {column: cell}}
    }
    getCell(row, column) {
        return this.cells[row][column];
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
    getGoing(ms = 250) {
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
        // actually John Conways Game has an infinite grid
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
const mycell = grid.getCell(grid.rows - 1, grid.columns - 1);
const goButton = document.querySelector('button#go');
goButton.addEventListener('click', () => {
    grid.getGoing();
});
const stopButton = document.querySelector('button#stop');
stopButton.addEventListener('click', () => {
    grid.pause();
});
const gliderButton = document.querySelector('button#glider');
gliderButton.addEventListener('click', () => {
    grid.setPattern('glider');
});
