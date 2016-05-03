# GameOfLife

This is an implementation of Conway's Game of Life with some twists.

- The four primary rules still apply:

1. Any live cell with fewer than two live neighbours dies, as if caused by \n
under-population.
2. Any live cell with two or three live neighbours lives on to the next \n
generation.
3. Any live cell with more than three live neighbours dies, as if by \n
over-population.
4. Any dead cell with exactly three live neighbours becomes a live cell, as if \n
by reproduction.

- The following are additional conditions:

5. Cells are given a color via an rgb value. Depending on the cells that seed \n
a new cell, a brand new color is generated.
6. Cells begin with certain opacity value. As a cell survives to a round its \n
opacity increases.

- Tech Used
* Vanilla Javascript (ES5)
* HTML5 Canvas
