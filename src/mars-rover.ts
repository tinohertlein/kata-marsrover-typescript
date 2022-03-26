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
    static readonly numberOfDirections =
        Object.entries(DirectionLetter).length / 2

    static readonly fromString = (directionLetter: string) =>
        new Direction(
            DirectionLetter[directionLetter as keyof typeof DirectionLetter]
        )
    static readonly fromLetter = (directionLetter: DirectionLetter) =>
        new Direction(directionLetter)

    private constructor(readonly letter: DirectionLetter) {}

    format = (): string => `${DirectionLetter[this.letter]}`
}

export class Position {
    static readonly fromCoordinates = (x: Coordinate, y: Coordinate) =>
        new Position(x, y)

    private constructor(readonly x: Coordinate, readonly y: Coordinate) {}

    format = (): string => `${this.x}:${this.y}`
}

export class Grid {
    static readonly DEFAULT_GRID = new Grid(10, 10)

    static readonly fromDimensions = (width: number, height: number) =>
        new Grid(width, height)

    private constructor(readonly width: number, readonly height: number) {}
}

export class RoverState {
    static readonly STARTING_STATE = new RoverState(
        Position.fromCoordinates(0, 0),
        Direction.fromLetter(DirectionLetter.N)
    )

    constructor(readonly position: Position, readonly direction: Direction) {}

    format = (): string =>
        `${this.position.format()}:${this.direction.format()}`
}

interface CommandExecutor {
    execute: (command: Command, roverState: RoverState) => RoverState
}

class MoveForward implements CommandExecutor {
    constructor(private readonly grid: Grid) {}

    execute(command: Command, roverState: RoverState): RoverState {
        if (command !== 'M') {
            return roverState
        }

        const currentX = roverState.position.x
        const currentY = roverState.position.y

        let unWrappedNextPosition: Position

        switch (roverState.direction.letter) {
            case DirectionLetter.N: {
                unWrappedNextPosition = Position.fromCoordinates(
                    currentX,
                    currentY + 1
                )
                break
            }
            case DirectionLetter.E: {
                unWrappedNextPosition = Position.fromCoordinates(
                    currentX + 1,
                    currentY
                )
                break
            }
            case DirectionLetter.S: {
                unWrappedNextPosition = Position.fromCoordinates(
                    currentX,
                    currentY - 1
                )
                break
            }
            case DirectionLetter.W: {
                unWrappedNextPosition = Position.fromCoordinates(
                    currentX - 1,
                    currentY
                )
                break
            }
        }
        return new RoverState(
            this.wrapAround(unWrappedNextPosition),
            roverState.direction
        )
    }

    private wrapAround = (unWrappedPosition: Position) =>
        Position.fromCoordinates(
            this.wrapAroundGridWidth(unWrappedPosition.x),
            this.wrapAroundGridHeight(unWrappedPosition.y)
        )

    private wrapAroundGridWidth = (coordinate: Coordinate): Coordinate =>
        this.applyModuloOperation(coordinate, this.grid.width)

    private wrapAroundGridHeight = (coordinate: Coordinate): Coordinate =>
        this.applyModuloOperation(coordinate, this.grid.height)

    private applyModuloOperation = (
        coordinate: Coordinate,
        max: Coordinate
    ): Coordinate => (coordinate + max) % max
}

abstract class Rotate {
    protected constructor(readonly rotateCommand: Command) {}

    execute(command: Command, roverState: RoverState): RoverState {
        if (command !== this.rotateCommand) {
            return roverState
        }
        return new RoverState(
            roverState.position,
            this.rotate(roverState.direction)
        )
    }

    protected abstract rotateLeftOrRight(direction: number): number

    private rotate = (direction: Direction): Direction => {
        const nextDirectionLetter =
            DirectionLetter[this.rotateLeftOrRight(direction.letter)]

        return Direction.fromString(nextDirectionLetter)
    }
}

class RotateLeft extends Rotate implements CommandExecutor {
    constructor() {
        super('L')
    }

    rotateLeftOrRight = (direction: number): number =>
        (Direction.numberOfDirections + direction - 1) %
        Direction.numberOfDirections
}

class RotateRight extends Rotate implements CommandExecutor {
    constructor() {
        super('R')
    }

    rotateLeftOrRight = (direction: number): number =>
        (Direction.numberOfDirections + direction + 1) %
        Direction.numberOfDirections
}

class Rover {
    constructor(
        private grid = Grid.DEFAULT_GRID,
        private roverState = RoverState.STARTING_STATE
    ) {}

    navigate = (input: string | undefined | null): string => {
        const toCommand = (character: string) => character as Command

        const commands = (input || '')
            .split('')
            .map((character) => toCommand(character))

        return this.execute(commands)
    }

    private execute = (commands: Command[]): string => {
        const commandExecutors = [
            new MoveForward(this.grid),
            new RotateLeft(),
            new RotateRight(),
        ]

        commands.forEach((command) => {
            commandExecutors.forEach((commandExecutor) => {
                this.roverState = commandExecutor.execute(
                    command,
                    this.roverState
                )
            })
        })

        return this.roverState.format()
    }
}

export default Rover
