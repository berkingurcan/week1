// imported required libraries
// expect, assert from chai blokchain testing library
const { expect, assert } = require("chai");
// ethers for interacting ethereum 
const { ethers } = require("hardhat");
// groth16 from zkSNARK implementation library
const { groth16 } = require("snarkjs");
const { plonk } = require("snarkjs");
// wasm_tester from circom_tester
const wasm_tester = require("circom_tester").wasm;
// ffjavascript package finite field arithmetic operations
// importing F1Field and Scalar
const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
// exports p value from Scalar value of the string value
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
// define new field from p
const Fr = new F1Field(exports.p);

// from https://github.com/iden3/ffjavascript/blob/master/src/utils_bigint.js
function unstringifyBigInts(o) {
    if (typeof o == "string" && /^[0-9]+$/.test(o)) {
      return BigInt(o);
    } else if (Array.isArray(o)) {
      return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
      const res = {};
      const keys = Object.keys(o);
      keys.forEach(k => {
        res[k] = unstringifyBigInts(o[k]);
      });
      return res;
    } else {
      return o;
    }
}

// Unit Testing HelloWorld
describe("HelloWorld", function () {
    // if it takes more than 100000000 miliseconds
    this.timeout(100000000);
    // declares Verifier 
    let Verifier;
    // declares verifier
    let verifier;

    // beforeEach runs before each test in this scope
    beforeEach(async function () {
        // get HelloWorldVerifier contract
        Verifier = await ethers.getContractFactory("HelloWorldVerifier");
        // deployed contract
        verifier = await Verifier.deploy();
        // waits verifier to be deployed
        await verifier.deployed();
    });

    // unit test which tests circuit multiplies two numbers correctly
    it("Circuit should multiply two numbers correctly", async function () {
        // import circuit
        const circuit = await wasm_tester("contracts/circuits/HelloWorld.circom");

        // INPUT Object
        const INPUT = {
            "a": 2,
            "b": 3
        }

        // calculate witness from circuit and input
        const witness = await circuit.calculateWitness(INPUT, true);

        //console.log(witness);

        // it checks 2*3 == 6
        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(6)));

    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing
        // generate proof for circuit and public signals
        const { proof, publicSignals } = await groth16.fullProve({"a":"2","b":"3"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey");

        // just logging publicSignals array's first element
        console.log('2x3 =',publicSignals[0]);
        
        // define calldata from proof and publicSignals
        const calldata = await groth16.exportSolidityCallData(proof, publicSignals);

        // converts the hex values in calldata to integer as string in a array
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());

        // define a,b,c from argv array
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        // '6' as Input
        const Input = argv.slice(8);

        // tests does it verified by contract
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });

    // provides parameters for invalid proof a,b,c,d
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        // tests is it false for invalid proof
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with Groth16", function () {
    this.timeout(100000000);
    let Verifier;
    let verifier;

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Multiplier3Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Circuit should multiply three numbers correctly", async function () {
        //[assignment] insert your script here
        const circuit = await wasm_tester("contracts/circuits/Multiplier3.circom");
        const INPUT = {
            "a": 2,
            "b": 3,
            "c": 4
        }

        const witness = await circuit.calculateWitness(INPUT, true);
        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1), ));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(24)));
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const { proof, publicSignals } = await groth16.fullProve({"a":"2","b":"3","c":"4"}, "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3/circuit_final.zkey");
        console.log('2x3x4 =',publicSignals[0]);

        const calldata = await groth16.exportSolidityCallData(proof, publicSignals);
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());

        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });

    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with PLONK", function () {

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("PlonkVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const { proof, publicSignals } = await plonk.fullProve({"a":"2","b":"3","c":"4"}, "contracts/circuits/Multiplier3_plonk/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3_plonk/circuit_final.zkey");
        console.log('2x3x4 =',publicSignals[0]);

        var calldata = await plonk.exportSolidityCallData(proof, publicSignals);
        const argv = calldata.split(',');

        expect(await verifier.verifyProof(argv[0], JSON.parse(argv[1]))).to.be.true;
    });
    
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = "0x00";
        let b = ['0'];
        expect(await verifier.verifyProof(a, b)).to.be.false;
    });
});