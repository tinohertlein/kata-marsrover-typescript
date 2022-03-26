const modulo = (n1: number, n2: number): number => (n1 + n2) % n2

type Command = 'M' | 'L' | 'R'

export type Coordinate = number

export enum DirectionLetter {
    // Order of enum-values is crucial, as rotate-operations rely on their index
    N,
    E,
    S,
    W,
}

export class Direction {
    static readonly numberOfDirections = Object.entries(DirectionLetter).length / 2

    private constructor(readonly letter: DirectionLetter) {}

    static readonly fromString = (directionLetter: string) =>
        new Direction(DirectionLetter[directionLetter as keyof typeof DirectionLetter])

    static readonly fromLetter = (directionLetter: DirectionLetter) => new Direction(directionLetter)

    format = (): string => `${DirectionLetter[this.letter]}`
}

export class Position {
    private constructor(readonly x: Coordinate, readonly y: Coordinate) {}

    static readonly fromCoordinates = (x: Coordinate, y: Coordinate) => new Position(x, y)

    format = (): string => `${this.x}:${this.y}`
}

export class Obstacle {
    private constructor(readonly position: Position) {}

    static readonly fromPosition = (position: Position) => new Obstacle(position)
}

export class Grid {
    static readonly DEFAULT_GRID = new Grid(10, 10)

    private constructor(readonly width: number, readonly height: number) {}

    static readonly fromDimensions = (width: number, height: number) => new Grid(width, height)
}

export class Plateau {
    static readonly DEFAULT_PLATEAU = new Plateau(Grid.DEFAULT_GRID, [])

    private constructor(readonly grid: Grid = Grid.DEFAULT_GRID, readonly obstacles: Obstacle[] = []) {}

    static readonly fromGrid = (grid: Grid) => new Plateau(grid, undefined)

    static readonly fromObstacles = (obstacles: Obstacle[]) => new Plateau(undefined, obstacles)

    static readonly fromGridAndObstacles = (grid: Grid, obstacles: Obstacle[]) => new Plateau(grid, obstacles)
}

export class RoverState {
    static readonly STARTING_STATE = new RoverState(
        Position.fromCoordinates(0, 0),
        Direction.fromLetter(DirectionLetter.N)
    )

    constructor(readonly position: Position, readonly direction: Direction, readonly error = false) {}

    format = (): string => `${this.error ? 'Err:' : ''}${this.position.format()}:${this.direction.format()}`
}

interface CommandExecutor {
    execute: (command: Command, roverState: RoverState) => RoverState
}

class Move implements CommandExecutor {
    constructor(private readonly moveCommand: Command, private readonly plateau: Plateau) {}

    execute(command: Command, roverState: RoverState): RoverState {
        if (command !== this.moveCommand) {
            return roverState
        }

        const currentPosition = roverState.position
        const currentX = currentPosition.x
        const currentY = currentPosition.y

        let unWrappedNextPosition: Position

        switch (roverState.direction.letter) {
            case DirectionLetter.N: {
                unWrappedNextPosition = Position.fromCoordinates(currentX, currentY + 1)
                break
            }
            case DirectionLetter.E: {
                unWrappedNextPosition = Position.fromCoordinates(currentX + 1, currentY)
                break
            }
            case DirectionLetter.S: {
                unWrappedNextPosition = Position.fromCoordinates(currentX, currentY - 1)
                break
            }
            case DirectionLetter.W: {
                unWrappedNextPosition = Position.fromCoordinates(currentX - 1, currentY)
                break
            }
        }
        const wrappedNextPosition = this.wrapAround(unWrappedNextPosition)
        const error = this.collidesWithObstacle(wrappedNextPosition)

        return new RoverState(error ? currentPosition : wrappedNextPosition, roverState.direction, error)
    }

    private collidesWithObstacle = (position: Position) =>
        !!this.plateau.obstacles.find(
            (obstacle) => obstacle.position.x === position.x && obstacle.position.y === position.y
        )

    private wrapAround = (unWrappedPosition: Position) =>
        Position.fromCoordinates(
            this.wrapAroundGridWidth(unWrappedPosition.x),
            this.wrapAroundGridHeight(unWrappedPosition.y)
        )

    private wrapAroundGridWidth = (coordinate: Coordinate): Coordinate =>
        modulo(coordinate, this.plateau.grid.width)

    private wrapAroundGridHeight = (coordinate: Coordinate): Coordinate =>
        modulo(coordinate, this.plateau.grid.height)
}

class Rotate implements CommandExecutor {
    constructor(readonly rotateCommand: Command, readonly leftOrRight: (direction: number) => number) {}

    execute(command: Command, roverState: RoverState): RoverState {
        if (command !== this.rotateCommand) {
            return roverState
        }
        return new RoverState(roverState.position, this.rotate(roverState.direction), roverState.error)
    }

    private rotate = (direction: Direction): Direction => {
        const nextDirectionLetter =
            DirectionLetter[modulo(this.leftOrRight(direction.letter), Direction.numberOfDirections)]

        return Direction.fromString(nextDirectionLetter)
    }
}

class Rover {
    constructor(
        private readonly plateau = Plateau.DEFAULT_PLATEAU,
        private roverState = RoverState.STARTING_STATE
    ) {}

    navigate = (input: string | undefined | null): string =>
        this.execute((input || '').split('').map((character) => character as Command))

    private execute = (commands: Command[]): string => {
        const commandExecutors = [
            new Move('M', this.plateau),
            new Rotate('L', (direction) => direction - 1),
            new Rotate('R', (direction) => direction + 1),
        ]

        commands.forEach((command) => {
            commandExecutors.forEach((commandExecutor) => {
                if (!this.roverState.error) {
                    this.roverState = commandExecutor.execute(command, this.roverState)
                }
            })
        })

        return this.roverState.format()
    }
}

export default Rover
