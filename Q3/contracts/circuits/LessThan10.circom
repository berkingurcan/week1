pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";

template LessThan10() {
    signal input in;
    signal output out;

    // 2**32 kullanarak LessThan templatei için Lessthanin input signal aralarındaki farkı 2**32 den az olmalı
    component lt = LessThan(32); 

    lt.in[0] <== in;
    lt.in[1] <== 10;

    out <== lt.out;
}