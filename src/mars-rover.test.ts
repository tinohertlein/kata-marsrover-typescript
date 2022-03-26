import Rover, {
    Direction,
    DirectionLetter,
    Grid,
    Position,
    RoverState,
} from './mars-rover'

describe('Mars Rover should', () => {
    describe('stay', () => {
        it.each([null, undefined])(
            `in start position if command is %s`,
            (input) => {
                expect(new Rover().navigate(input)).toEqual('0:0:N')
            }
        )
    })

    describe('start', () => {
        test('at given state', () => {
            expect(new Rover().navigate('')).toEqual('0:0:N')
        })
        test(`at '0:0.N' if no starting state is given'`, () => {
            const roverState = new RoverState(
                Position.fromCoordinates(4, 6),
                Direction.fromLetter(DirectionLetter.S)
            )
            const rover = new Rover(undefined, roverState)

            expect(rover.navigate('')).toEqual('4:6:S')
        })
    })

    describe('move forward', () => {
        describe('not wrapping around edges', () => {
            const grid = Grid.fromDimensions(10, 10)
            const position = Position.fromCoordinates(5, 5)

            it.each([
                ['N', '5:6:N'],
                ['W', '4:5:W'],
                ['E', '6:5:E'],
                ['S', '5:4:S'],
            ])(
                `one step in direction %s`,
                (directionLetter: string, expected: string) => {
                    const roverState = new RoverState(
                        position,
                        Direction.fromString(directionLetter)
                    )
                    const rover = new Rover(grid, roverState)

                    expect(rover.navigate('M')).toEqual(expected)
                }
            )
        })

        describe('wrapping around edges', () => {
            const grid = Grid.fromDimensions(2, 2)
            const position = Position.fromCoordinates(0, 0)

            it.each([
                ['N', '0:1:N'],
                ['W', '1:0:W'],
                ['E', '1:0:E'],
                ['S', '0:1:S'],
            ])(
                `one step in direction %s`,
                (directionLetter: string, expected: string) => {
                    const roverState = new RoverState(
                        position,
                        Direction.fromString(directionLetter)
                    )
                    const rover = new Rover(grid, roverState)

                    expect(rover.navigate('M')).toEqual(expected)
                }
            )
        })
    })

    describe('rotate', () => {
        describe('left', () => {
            const grid = Grid.fromDimensions(2, 2)
            const position = Position.fromCoordinates(0, 0)

            it.each([
                ['N', '0:0:W'],
                ['W', '0:0:S'],
                ['E', '0:0:N'],
                ['S', '0:0:E'],
            ])(`facing %s`, (directionLetter: string, expected: string) => {
                const roverState = new RoverState(
                    position,
                    Direction.fromString(directionLetter)
                )
                const rover = new Rover(grid, roverState)

                expect(rover.navigate('L')).toEqual(expected)
            })
        })

        describe('right', () => {
            const grid = Grid.fromDimensions(2, 2)
            const position = Position.fromCoordinates(0, 0)

            it.each([
                ['N', '0:0:E'],
                ['W', '0:0:N'],
                ['E', '0:0:S'],
                ['S', '0:0:W'],
            ])(`facing %s`, (directionLetter: string, expected: string) => {
                const roverState = new RoverState(
                    position,
                    Direction.fromString(directionLetter)
                )
                const rover = new Rover(grid, roverState)

                expect(rover.navigate('R')).toEqual(expected)
            })
        })
    })

    describe('ignore', () => {
        test('unknown commands', () => {
            expect(new Rover().navigate('MTM')).toEqual('0:2:N')
        })
    })

    describe('pass acceptance tests', () => {
        describe('with given input in README.md:', () => {
            test(`''`, () => {
                expect(new Rover().navigate('')).toEqual('0:0:N')
            })

            test(`'MMRMMLM'`, () => {
                expect(new Rover().navigate('MMRMMLM')).toEqual('2:3:N')
            })

            test(`'MMMMMMMMMM'`, () => {
                expect(new Rover().navigate('MMMMMMMMMM')).toEqual('0:0:N')
            })
        })
    })
})
