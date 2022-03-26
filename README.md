# The Mars Rover Kata

![kata-marsrover-typescript](https://github.com/tinohertlein/kata-marsrover-typescript/actions/workflows/ci.yml/badge.svg?event=push)

## Situation

A squad of robotic rovers are to be landed by NASA on a plateau on Mars.

This plateau, which is curiously rectangular, must be navigated by the rovers so that their onboard cameras can get a
complete view of the surrounding terrain to send back to Earth.

## Task

Your task is to develop an API that moves the rovers around on the plateau.

In this API, the plateau is represented as a **10x10** grid with obstacles at given coordinates. A rover has a state
consisting of two parts:

* its position on a grid (represented by an **X,Y** coordinate pair)
* the compass direction it's facing (represented by a letter, one of **N, S, E, W**)

### Input

The input to the program is a string of one-character commands:

* L and R rotate the direction the rover is facing
* M moves the rover one grid square forward in the direction it is currently facing

If a rover reaches the end of the plateau, it wraps around the end of the grid.

### Output

The program's output is the final state of the rover after all the move commands have been executed or before an obstacle is encountered.

The state is represented as a position and a direction, joined by colons to form a string. For example: a rover whose
state is 2:3:W is at position (2,3), facing west.

If the rover encountered an obstacle on its way, it stops before the obstacle and returns with an error, indicated by
an 'Err:' prefixed to the state.

### Examples

* given a grid, input '' gives output '0:0:N'
* given a grid without obstacles, input 'MMRMMLM' gives output '2:3:N'
* given a grid without obstacles, input 'MMMMMMMMMM' gives output '0:0:N' (due to wrap-around)
* given a grid with an obstacle at '0,3', input 'MMMM' gives output 'Err:0:2:N' 

