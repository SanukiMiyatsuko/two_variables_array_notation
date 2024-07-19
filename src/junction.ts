import { Zero_Function } from './code/code_a_Zero';
import { Subspecies_Function } from './code/code_b_Subspecies';
import { Italy_Function } from './code/code_c_Italy';
import { Old_Subspecies_Function } from './code/code_d_OldSubspecies';
import { B_Function } from './code/code_e_B';
import { Buchholzs_Psi_Function } from './code/code_f_BuchholzsPsi';
import { Goal_Function } from "./code/code_g_Goal";
import { Side_Bamboo_Function } from './code/code_h_SideBamboo';
import { Side_Mushroom_Function } from './code/code_i_SideMushroom';
import { Options, T } from './intersection';

export type strT = {
    str: string;
    term: T;
}

export interface Hyouki {
    fund(a: T, b: T, options: Options): strT;
    dom(a: T, options: Options): strT;
}

export function switchFunc(fnName: string): Hyouki {
    switch (fnName) {
        case "〇":
            return new Zero_Function();
        case "亜":
            return new Subspecies_Function();
        case "伊":
            return new Italy_Function();
        case "亞":
            return new Old_Subspecies_Function();
        case "B":
            return new B_Function();
        case "ψ":
            return new Buchholzs_Psi_Function();
        case "G":
            return new Goal_Function();
        case "竹":
            return new Side_Bamboo_Function();
        case "茸":
            return new Side_Mushroom_Function();
        default:
            throw new Error("不明な操作");
    }
}