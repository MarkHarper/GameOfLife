var gol = (function() {
      var app = {};

      //Collection of cells
      app.collection = [];

      //Collection Cache of cells
      app.cache = [];

      //Cell prototype should contain: status, color properties, maturity, and a draw function
      app.Cell = function() {
        this.status = 'dead';
        this.r = '255';
        this.g = '255';
        this.b = '255';
        this.a = '1';
      };

      app.updateCellStatus = function(cell, status) {
        cell.status = status;
      };

      app.updateCellColor = function(cell, r, g, b, a) {
        cell.r = r;
        cell.g = g;
        cell.b = b;
        cell.a = a;
      };

      app.mature = function(cell, mature) {
        cell.a = String(Number(cell.a) + 0.1);
      };

      app.setLocation = function(cell, x, y) {
        cell.x = x;
        cell.y = y;
      }

      app.setCellIndex = function(cell, row, column) {
        cell.row = row;
        cell.col = column;
      }

      app.findCell = function(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        var x = 1 + (evt.clientX - rect.left) - (evt.clientX - rect.left) % 10;
        var y = 1 + (evt.clientY - rect.top) - (evt.clientY - rect.top) % 10;
        return {
          x: x,
          y: y
        };
      }

      app.cellContains = function(cell, x, y, board) {
        if (x >= cell.x - 1 && x < cell.x + Number(board.cellWidth) + 1) {
          if (y >= cell.y - 1 && y < cell.y + Number(board.cellHeight) + 1) {
            return true;
          }
        }
      }

      app.getCell = function(x, y, board) {
        for (var col = 0, maxCol = board.columns; col < maxCol; col++) {
          for (var row = 0, maxRow = board.rows; row < maxRow; row++) {
            var cell = app.collection[col][row];
            if (app.cellContains(cell, x, y, board)) {
              return cell;
            }
          }
        }
      }

      app.drawCell = function(cell, x, y, board) {
        var c = document.getElementById("golBoard");
        var ctx = c.getContext("2d");
        ctx.fillStyle = 'rgba(' + cell.r + ',' + cell.g + ',' + cell.b + ', '+ cell.a +')';
        ctx.fillRect(cell.x, cell.y, board.cellWidth - 1, board.cellHeight - 1);
      };

      app.lifeOrDeath = function(cell) {
        cell.status = cell.status === 'dead' ? 'alive' : 'dead';
        if (cell.status === 'dead') {
          cell.r = '255';
          cell.g = '255';
          cell.b = '255';
          cell.a = '1';
        }
      }

      app.life = function(cell) {
        cell.status = 'alive';
      }

      app.kill = function(cell) {
        cell.status = 'dead';
        cell.r = '255';
        cell.g = '255';
        cell.b = '255';
        cell.a = '1';
      }

      app.convertToRGB = function (hex) {
         var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
         return result ? {
             r: parseInt(result[1], 16),
             g: parseInt(result[2], 16),
             b: parseInt(result[3], 16)
         } : null;
       }

       app.getColor = function () {
         var hex = document.getElementById('color').value;
         var rgb = app.convertToRGB(hex);
         return rgb;
       }

      //Board prototype should contain: board size, cell size, col/row # and a load function
      app.Board = function() {
        this.height = '500';
        this.width = '500';
        this.cellHeight = '10';
        this.cellWidth = '10';
        this.rows = Math.floor(Number(this.height) / (Number(this.cellHeight)));
        this.columns = Math.floor(Number(this.width) / (Number(this.cellWidth)));
      }

      app.drawBoard = function(board) {
        var golBoard = document.getElementById("golBoard");
        golBoard.setAttribute('width', (Number(board.width) + 1) + 'px');
        golBoard.setAttribute('height', (Number(board.height) + 1) + 'px');
      };

      app.drawGrid = function(board) {
        var c = document.getElementById("golBoard");
        var ctx = c.getContext("2d");
        var cellTotal = (board.rows * board.columns)*Number(board.cellWidth);
        for (var x = 0.5; x < cellTotal + 1; x += Number(board.cellWidth)) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, cellTotal);
        }
        for (var y = 0.5; y < cellTotal + 1; y += Number(board.cellWidth)) {
          ctx.moveTo(0, y);
          ctx.lineTo(cellTotal, y);
        }
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#ddd";
        ctx.stroke();
      }

      app.loadBoard = function(board) {
        app.drawBoard(board);
        board.cellColor = app.getColor();
        var collection = [];
        for (var col = 0, maxCol = board.columns; col < maxCol; col++) {
          collection[col] = [];
          for (var row = 0, maxRow = board.rows; row < maxRow; row++) {
            var cell = new app.Cell();
            app.setLocation(cell, (col * board.cellWidth) + 1, (row * board.cellHeight + 1));
            app.setCellIndex(cell, row, col);
            app.updateCellColor(cell, board.cellColor.r, board.cellColor.g, board.cellColor.b, '1');
            collection[col][row] = cell;
          }
        }
        app.collection = collection;
      };

      //Game Controller should manage mode (seed,start,pause & clear), speed, selection color and mouse events on the grid
      app.gControl = {
        events: function(board) {
          var gBoard = document.getElementById("golBoard");
          var start = document.getElementById("start");
          var color = document.getElementById("color");
          gBoard.addEventListener('mousedown', function(evt) {
            var col = Math.floor(evt.offsetX / Number(board.cellWidth));
            var row = Math.floor(evt.offsetY / Number(board.cellWidth));
            var cell = app.collection[col][row];
            if (cell) {
              app.updateCellColor(cell, board.cellColor.r, board.cellColor.g, board.cellColor.b, 0.1);
              app.lifeOrDeath(cell);
              app.mature(cell);
              app.drawCell(cell, cell.x, cell.y, board);
            }
            app.MOUSEDOWN = true;
          });
          gBoard.addEventListener('mousemove', function(evt) {
            if (app.MOUSEDOWN) {
              var cell = app.collection[Math.floor(evt.offsetX / Number(board.cellWidth))][Math.floor(evt.offsetY / Number(board.cellWidth))];
              if (cell) {
                app.updateCellColor(cell, board.cellColor.r, board.cellColor.g, board.cellColor.b, 0.1);
                app.life(cell);
                app.mature(cell);
                app.drawCell(cell, cell.x, cell.y, board);
              }
            }
          });
          document.addEventListener('mouseup', function(evt) {
            app.MOUSEDOWN = false;
          });
          color.addEventListener('input', function(evt) {
            board.cellColor = app.getColor();
          });
          start.addEventListener('click', function(evt) {
            cycle();
            function cycle() {
                 setTimeout(function () {
                     app.run(board)
                     cycle();
                 }, 100);
             }
          });
        }
      };

      //Game Logic function should apply the rules of the game by killing/birthing/maintaining cells, increasing maturity, and calculating color
      app.run = function(board) {
        app.cache = JSON.parse(JSON.stringify(app.collection));
        for (var col = 0, maxCol = board.columns; col < maxCol; col++) {
          for (var row = 0, maxRow = board.rows; row < maxRow; row++) {
            var cacheCell = app.cache[col][row];
            var realCell = app.collection[col][row];
            var neighborLocations = {
              topRow: row - 1 < 0 ? board.rows - 1 : row - 1,
              rightCol: col + 1 > board.columns - 1 ? 0 : col + 1,
              bottomRow: row + 1 > board.rows - 1 ? 0 : row + 1,
              leftCol: col - 1 < 0 ? board.columns - 1 : col - 1,
              midCol: realCell.col,
              midRow: realCell.row
            };
            var neighbors = app.surveyNeighbors(neighborLocations);
            if (cacheCell.status === 'dead' && neighbors.length === 3) {
              app.updateCellColor(realCell, neighbors[0].r, neighbors[1].g, neighbors[2].b, 0.1);
              app.lifeOrDeath(realCell);
              app.mature(realCell);
              app.drawCell(realCell, realCell.x, realCell.y, board);
              continue;
            } else if (cacheCell.status === 'alive' && (neighbors.length > 3 || neighbors.length < 2)) {
               app.kill(realCell);
               app.drawCell(realCell, realCell.x, realCell.y, board);
               continue;
            } else if (cacheCell.status === 'alive' && (neighbors.length <= 3 || neighbors.length >= 2)) {
               app.mature(realCell);
               app.drawCell(realCell, realCell.x, realCell.y, board);
               continue;
            } else if (cacheCell.status === 'dead' && neighbors.length !== 3) {
               app.updateCellColor(realCell, '255', '255', '255', '1');
               app.drawCell(realCell, realCell.x, realCell.y, board);
               continue;
            }
              }
             }
            };


        app.surveyNeighbors = function(locs) {
          var livingNeighbors = [];
          var check = function(col, row) {
            var cacheCell = app.cache[col][row];
            if (cacheCell.status === 'alive') {
              livingNeighbors.push(cacheCell);
            }
          }
          check(locs.leftCol,locs.midRow);
          check(locs.leftCol,locs.topRow);
          check(locs.midCol,locs.topRow);
          check(locs.rightCol,locs.topRow);
          check(locs.rightCol,locs.midRow);
          check(locs.rightCol,locs.bottomRow);
          check(locs.midCol,locs.bottomRow);
          check(locs.leftCol,locs.bottomRow);
          return livingNeighbors;
        }

        return {

          //Init function to setup the GOL component
          init: function() {
            var board = new app.Board();
            app.loadBoard(board);
            app.drawGrid(board);
            app.gControl.events(board);
          }

        };

      })();

    gol.init();
