pragma circom 2.0.0;

// [assignment] Modify the circuit below to perform a multiplication of three signals
template Multiplier2() {
   signal input a;
   signal input b;
   signal output c;

   c <== a * b;
}

template Multiplier3 () {  

   // Declaration of signals.  
   signal input a;  
   signal input b;
   signal input c;
   signal output d;  

   component e = Multiplier2();
   component f = Multiplier2();

   e.a <== a;
   e.b <== b;
   f.a <== e.c;
   f.b <== c;
   d <== f.c;
}

component main = Multiplier3();