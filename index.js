var enumMode = { human: "human", AI: "AI" };
var enumLevel = { easy: "easy", normal: "normal", unbeatable: "unbeatable" };
var enumStatus = { playing: 0, over: 1 };
var enumResult = { pending: 0, draw: 1, win: 2 };
var enumSide = { nought: 0, cross: 1 };
var enumCellStatus = { empty: 0, nought: 1, cross: 2 };

var names = ["foo", "bar", "baz"];
var initialTurn = enumSide.nought;

/**
 * get 2d index array of cells in board
 */
var getAvailableCells = function (board) {
	var availableCells = [];
	var i, j;
	for (i=0;i<3;i++) {
		for (j=0;j<3;j++) {
			if (board[i][j] === enumCellStatus.empty) {
				availableCells.push([i,j]);
			}
		}
	}
	return availableCells;
}
/**
 * get index of chance cell from given cell list,
 * or -1 when not found
 */
var chanceIndex = function(arr, target) {
	var emptyIndex = -1;
	for (var i =0;i<arr.length;i++) {
		if (arr[i] === enumCellStatus.empty) {
			if (emptyIndex !== -1){
				return -1;
			}
			emptyIndex = i;
		} else if (arr[i] !== target){
			return -1;
		}
	}
	return emptyIndex;
}
/**
 * get 2d index of chance cell in board,
 * or null when not found
 */
var chance = function (board, cellStatus) {
	for (i=0;i<3;i++) {
		var rowArr = [board[i][0], board[i][1], board[i][2]]
		var rowChanceIndex = chanceIndex(rowArr, cellStatus);
		if (rowChanceIndex !== -1) {
			return [i,rowChanceIndex];
		}
		var colArr = [board[0][i], board[1][i], board[2][i]]
		var colChanceIndex = chanceIndex(colArr, cellStatus);
		if (colChanceIndex !== -1) {
			return [colChanceIndex, i];
		}
	}
	var diagonalArr1 = [board[0][0], board[1][1], board[2][2]];
	var diagonalChanceIndex1 = chanceIndex(diagonalArr1, cellStatus);
	if (diagonalChanceIndex1 !== -1) {
		return [diagonalChanceIndex1, diagonalChanceIndex1];
	}
	var diagonalArr2 = [board[2][0], board[1][1], board[0][2]];
	var diagonalChanceIndex2 = chanceIndex(diagonalArr2, cellStatus);
	if (diagonalChanceIndex2 !== -1) {
		return [2-diagonalChanceIndex2, diagonalChanceIndex2];
	}
	return null;
}
/**
 * get strategy for next step,
 * or null if no more available cell
 */
var nextStrategy = function(board, level, selfCellStatus, opponentCellStatus) {
	var availableCells = getAvailableCells(board);
	var len = availableCells.length;
	if (len === 0) {
		return null;
	}
	if (len === 1) {
		return availableCells[0];
	}
	if (level === enumLevel.easy) {
		// randomly pick a cell
		return availableCells[parseInt(Math.random()*len)];
	} else {
		// check for chance
		var selfChance = chance(board, selfCellStatus);
		if (selfChance !== null) {
			return selfChance;
		}
		// check for danger
		var opponentChance = chance(board, opponentCellStatus);
		if (opponentChance !== null) {
			return opponentChance;
		}
		
		if (len <= 2) {
			// to draw
			return availableCells[0];
		}
		if (level === enumLevel.normal) {
			// randomly pick a cell
			return availableCells[parseInt(Math.random()*len)];
		} else {
			if (len % 2 === 0) {
				// gamer1 first
				switch (len) {
					case 8:
						if (board[0][0] === opponentCellStatus
							|| board[0][2] === opponentCellStatus
							|| board[2][0] === opponentCellStatus
							|| board[2][2] === opponentCellStatus) {
							return [1,1];
						}
						return [0,0];
					case 6:
						if (board[0][0] === selfCellStatus) {
							if (board[1][1] === opponentCellStatus) {
								return [0,2];
							}
							return [1,1];
						} else { // a corner === opponentCellStatus
							var opponentCornerCount = 0;
							var selfPossibility = null;
							if (board[0][0] === opponentCellStatus) {
								opponentCornerCount += 1;
								selfPossibility = board[2][1] === opponentCellStatus ? [2,0]: [0,2];
							}
							if (board[0][2] === opponentCellStatus) {
								opponentCornerCount += 1;
								selfPossibility = board[2][1] === opponentCellStatus ? [2,2]: [0,0];
							}
							if (board[2][0] === opponentCellStatus) {
								opponentCornerCount += 1;
								selfPossibility = board[0][1] === opponentCellStatus ? [0,0]: [2,2];
							}
							if (board[2][2] === opponentCellStatus) {
								opponentCornerCount += 1;
								selfPossibility = board[0][1] === opponentCellStatus ? [0,2]: [2,0];
							}
							if (opponentCornerCount === 2) {
								return [0,1];
							}
							return selfPossibility;
						}
					default:
						return availableCells[0];
						break;
				}
				// TODO: unbeatable strategy
			} else {
				// AI first
				switch (len) {
					case 9:
						return [0,0];
					case 7:
						if (board[2][2] === enumCellStatus.empty) {
							return [2,2];
						} else {
							return [0,2];
						}
					case 5:
						if (board[0][2] === enumCellStatus.empty) {
							return [0,2];
						} else {
							return [2,0];
						}
					default:
						console.error("impossible to be here except bug");
						break;
				}
			}
		}
	}
}

/**
 * game data
 */
var game = {
	mode: enumMode.human,
	level: enumLevel.normal,
	status: enumStatus.playing,
	result: enumResult.pending,
	winner: "",
	turn: initialTurn,
	board: [
		[enumCellStatus.empty, enumCellStatus.empty, enumCellStatus.empty],
		[enumCellStatus.empty, enumCellStatus.empty, enumCellStatus.empty],
		[enumCellStatus.empty, enumCellStatus.empty, enumCellStatus.empty]
	],
	gamer1: {
		side: parseInt(Math.random()*2),
		name: ""
	},
	gamer2: {
		name: ""
	}
};

/**
 * view model
 */
var vm = new Vue({
	el: "#app",
	data: game,
	watch: {
		mode: function(val) {
			if (val === "AI"){
				this.gamer2.name = names[parseInt(Math.random() * names.length)];
			} else {
				this.gamer2.name = "";
			}
			this.newGame();
		},
		level: function(val) {
			this.gamer2.name = names[parseInt(Math.random() * names.length)];
			this.newGame();
		}
	},
	computed: {
		gamer1SideFlag: function () {
			return this.gamer1.side === enumSide.nought ? "O" : "X";
		},
		gamer2SideFlag: function () {
			return this.gamer2Side === enumSide.nought ? "O" : "X";
		},
		gamer2Side: function () {
			return this.gamer1.side === enumSide.nought ? enumSide.cross: enumSide.nought;
		},
		gamer1TargetCellStatus: function () {
			return this.gamer1.side === enumSide.nought ? enumCellStatus.nought: enumCellStatus.cross;
		},
		gamer2TargetCellStatus: function () {
			return this.gamer2Side === enumSide.nought ? enumCellStatus.nought: enumCellStatus.cross;
		},
		gameover: function () {
			return this.status === enumStatus.over;
		},
		gameResult:  function () {
			return this.result === enumResult.draw ? "draw": "winner is " + this.winner;
		}
	},
	methods: {
		checkStatus: function() {
			var over = false;
			var cellStatus = enumCellStatus.empty;
			for (var i=0;i<3;i++) {
				if (this.board[i][0] !== enumCellStatus.empty && this.board[i][0] === this.board[i][1] && this.board[i][0] === this.board[i][2]) {
					// check row
					over = true;
					cellStatus = this.board[i][0];
					break;
				} else if (this.board[0][i] !== enumCellStatus.empty && this.board[0][i] === this.board[1][i] && this.board[0][i] === this.board[2][i]) {
					// check column
					over = true;
					cellStatus = this.board[0][i];
					break;
				}
			}
			if (!over && this.board[1][1] !== enumCellStatus.empty
				&& (this.board[0][0] === this.board[1][1] && this.board[0][0] ===this.board[2][2]
					|| (this.board[0][2] === this.board[1][1] && this.board[0][2] ===this.board[2][0]))) {
				// check diagonals
				over = true;
				cellStatus = this.board[1][1];
			}
			if (over) {
				this.status = enumStatus.over;
				this.result = enumResult.win;
				this.winner = this.gamer1TargetCellStatus === cellStatus
					? (this.gamer1.name || "gamer1")
					: (this.gamer2.name || "gamer2");
			} else {
				// check if still has cells available
				var availableCells = getAvailableCells(this.board);
				if (availableCells.length === 0) {
					this.status = enumStatus.over;
					this.result = enumResult.draw;
				} else {
					// not over, Chance turn
					this.turn = this.turn === enumSide.nought ? enumSide.cross: enumSide.nought;
					this.next();
				}
			}
		},
		newGame: function() {
			this.status = enumStatus.playing;
			this.result = enumResult.pending;
			this.winner= "";
			this.turn = initialTurn;
			this.board = [
				[enumCellStatus.empty, enumCellStatus.empty, enumCellStatus.empty],
				[enumCellStatus.empty, enumCellStatus.empty, enumCellStatus.empty],
				[enumCellStatus.empty, enumCellStatus.empty, enumCellStatus.empty]
			];
			this.gamer1.side = parseInt(Math.random()*2);
			this.next(null);
		},
		next: function () {
			if (this.mode === enumMode.AI && this.turn === this.gamer2Side) {
				// AI turn
				var strategy = nextStrategy(this.board, this.level, this.gamer2TargetCellStatus, this.gamer1TargetCellStatus);
				Vue.set(this.board[strategy[0]], strategy[1], this.turn === enumSide.nought ? enumCellStatus.nought: enumCellStatus.cross);
				this.checkStatus();
			}
		},
		onCellClick: function(r, c) {
			if (this.status === enumStatus.over) {
				// game over
				return;
			}
			var cell = this.board[r][c];
			if (cell === enumCellStatus.empty) {
				// cell available, Chance cell status
				Vue.set(this.board[r], c, this.turn === enumSide.nought ? enumCellStatus.nought: enumCellStatus.cross);
				// check game status
				this.checkStatus();
			}
		}
	}
});