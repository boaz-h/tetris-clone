const width = 400;
const height = 600;
const blockSize = 400/10;

/*
	board blocks numbering on canvas:
	0 -----> x
	|
	|
	|
	v
	y
*/

class Block
{
	constructor(points, color)
	{
		this.points = points;
		this.color = color;
	}
	// rotation matrix: T(x,y)*R*T(−x,−y)(p)
	// rotation around 2nd point
	// return: new points
	rotate()
	{
		let rotation_point = this.points[1];
		let rotator = (p) => {
			let x = p.x;
			let y = p.y;
			// T(-x, -y)
			x = x - rotation_point.x;
			y = y - rotation_point.y;
			
			// Rotation with theta = 90 degree
			[x, y] = [-y, x];
			
			// T(x, y)
			x = x + rotation_point.x;
			y = y + rotation_point.y;
			
			return {x: x, y: y}
		}
		
		
		const rotated_points = new Array(rotator(this.points[0]), rotator(this.points[1]), rotator(this.points[2]), rotator(this.points[3]));
		return rotated_points;
	}
}

function LBlock()
{
	return new Block(
		new Array({x:5, y:0}, {x:5, y:1}, {x:5, y:2}, {x:4, y:2}),
		1
	);
}

function SwiglyBlock()
{
	return new Block(
		new Array({x:5, y:0}, {x:5, y:1}, {x:4, y:1}, {x:4, y:2}),
		2
	);
}

function ReverseSwiglyBlock()
{
	return new Block(
		new Array({x:4, y:0}, {x:4, y:1}, {x:5, y:1}, {x:5, y:2}),
		3
	);
}

function ReverseLBlock()
{
	return new Block(
		new Array({x:4, y:0}, {x:4, y:1}, {x:4, y:2}, {x:5, y:2}),
		4
	);
}

function TBlock()
{
	return new Block(
		new Array({x:5, y:0}, {x:5, y:1}, {x:4, y:1}, {x:6, y:1}),
		6
	);
}

function LineBlock()
{
	return new Block(
		new Array({x:5, y:0}, {x:5, y:1}, {x:5, y:2}, {x:5, y:3}),
		7
	);
}

class SquareBlock extends Block
{
	constructor() {
		super();
		this.points = new Array({x:4, y:0}, {x:5, y:0}, {x:4, y:1}, {x:5, y:1});
		this.color = 5;
	}
	
	// no rotation for square
	// return: new points
	rotate()
	{
		return Array.from(this.points, (p) => {return {x:p.x, y:p.y};})
	}
}

function createNewBlock()
{
	// array of functors, to not generate blocks every call.
	const blocks = [
		() => LBlock(),
		() => SwiglyBlock(),
		() => ReverseSwiglyBlock(),
		() => ReverseLBlock(),
		() => new SquareBlock(),
		() => TBlock(),
		() => LineBlock()
	]
	return blocks[Math.floor(Math.random() * blocks.length)]();
}

/*
	board blocks numbering on canvas:
	0 -----> width
	|
	|
	|
	v
	height
*/
class Board
{
	constructor(width, height)
	{
		this.data = Array.from({ length: height / blockSize }, () => Array(width / blockSize).fill(0));
		this.piece = createNewBlock();
	}
	
	
	draw(ctx)
	{
		ctx.clearRect(0, 0, this.data[0].length * blockSize , this.data.length * blockSize);
		let colorBlock = (i, j, color) => {
			switch (color)
			{
				case 1:
					ctx.fillStyle = "green";
					break;
				case 2:
					ctx.fillStyle = "red";
					break;
				case 3:
					ctx.fillStyle = "blue";
					break;
				case 4:
					ctx.fillStyle = "yellow";
					break;
				case 5:
					ctx.fillStyle = "cyan";
					break;
				case 6:
					ctx.fillStyle = "orange";
					break;
				case 7:
					ctx.fillStyle = "purple";
					break;
				default:
					break;
			}
			ctx.fillRect(j*blockSize, i*blockSize, blockSize, blockSize);
			ctx.strokeStyle = "black";
			ctx.strokeRect(j*blockSize, i*blockSize, blockSize, blockSize);
			
		};
		
		for (let y = 0; y < this.data.length; y++)
		{
			for (let x = 0; x < this.data[y].length; x++)
			{
				if (this.data[y][x] != 0)
				{
					colorBlock(y, x, this.data[y][x]);
				}
			}
		}
		
		for (const point of this.piece.points)
		{
			colorBlock(point.y, point.x, this.piece.color);
		}
	}
	
	isValidNewPoint(x, y)
	{
		return y >= 0 && y < this.data.length && x >= 0 && x < this.data[0].length && this.data[y][x] == 0;
	}
	
	rotate()
	{
		let new_points = this.piece.rotate();
		if (new_points.every((point) => this.isValidNewPoint(point.x, point.y)))
		{
			this.piece.points = new_points;
		}
		document.dispatchEvent( new Event("draw"));
	}
	
	moveRight()
	{
		let new_points = Array.from(this.piece.points, (p) => {return {x:p.x + 1, y:p.y}});
		if (new_points.every((point) => this.isValidNewPoint(point.x, point.y)))
		{
			this.piece.points = new_points;
		}
		document.dispatchEvent( new Event("draw"));
	}
	
	moveLeft()
	{
		let new_points = Array.from(this.piece.points, (p) => {return {x:p.x - 1, y:p.y}});
		if (new_points.every((point) => this.isValidNewPoint(point.x, point.y)))
		{
			this.piece.points = new_points;
		}
		document.dispatchEvent( new Event("draw"));
	}
	
	isEndGame(points)
	{
		return !points.every((point) => this.isValidNewPoint(point.x, point.y))
	}
	
	advance()
	{
		let new_points = Array.from(this.piece.points, (p) => {return {x:p.x, y:p.y + 1}});
		if (new_points.every((point) => this.isValidNewPoint(point.x, point.y)))
		{
			this.piece.points = new_points;
			document.dispatchEvent( new Event("draw"));
		}
		else
		{
			// make piece part of the board
			for (const point of this.piece.points)
			{
				this.data[point.y][point.x] = this.piece.color;
			}
			// clear filled lines
			const origHeight = this.data.length;
			const origWidth = this.data[0].length;
			this.data = this.data.filter((row) => !row.every((cell) => cell != 0));
			const new_empty_rows = Array.from({ length: origHeight - this.data.length }, () => Array(origWidth).fill(0));
			this.data = new_empty_rows.concat(this.data);
			// add new piece
			this.piece = createNewBlock();
			if (this.isEndGame(this.piece.points))
			{
				document.dispatchEvent( new Event("gameover"));
			}
			else
			{
				document.dispatchEvent( new Event("draw"));
			}
		}
	}
}


function main()
{
	const canvas = document.getElementById("board");
	const ctx = canvas.getContext("2d");
	let board = new Board(canvas.width, canvas.height);
	let arrowHandler = (event) =>
	{
		switch (event.key) {
			case 'ArrowUp':
				board.rotate();
				break;
			case 'ArrowDown':
				board.advance();
				break;
			case 'ArrowLeft':
				board.moveLeft();
				break;
			case 'ArrowRight':
				board.moveRight();
				break;
		}
	};
	document.addEventListener("keydown", arrowHandler);
	
	
	board.draw(ctx)
	const intervalId = setInterval(() =>
	{
		board.advance();
	}, 1000);
	
	document.addEventListener("draw", (event) =>
	{
		board.draw(ctx);
	});
	document.addEventListener("gameover", (event) =>
	{
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.font = "48px serif";
		ctx.fillStyle = "red";
		const message = "GAME OVER";
		const msg_width = ctx.measureText(message).width; // to calculate middle of screen
		ctx.fillText(message, (width - msg_width) / 2, height/2);
		board = new Board(width, height);
		clearInterval(intervalId);
		document.removeEventListener("keydown", arrowHandler);
	});
}
