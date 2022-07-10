pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib-matrix/circuits/matMul.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";



template SystemOfEquations(n) { // n is the number of variables in the system of equations
    signal input x[n]; // this is the solution to the system of equations
    signal input A[n][n]; // this is the coefficient matrix
    signal input b[n]; // this are the constants in the system of equations
    signal output out; // 1 for correct solution, 0 for incorrect solution

    // [bonus] insert your code here
    // A * x = b
    component mm = matMul(n,n,1);
    component isEq[n];
    component isEq2 = IsEqual();

    for (var i=0; i<n; i++) {
        for (var j=0; j<n; j++) {
            mm.a[i][j] <== A[i][j];
        }
        mm.b[i][0] <== x[i];
    }

    var sum = 0;

    for (var i=0; i<n; i++) {
        isEq[i] = IsEqual();
        isEq[i].in[0] <== mm.out[i][0];
        isEq[i].in[1] <== b[i];

        sum += isEq[i].out;
    }

    isEq2.in[0] <== n;
    isEq2.in[1] <== sum;

    out <== isEq2.out;
}

component main {public [A, b]} = SystemOfEquations(3);