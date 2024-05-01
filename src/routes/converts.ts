import { latex_primitives } from "./latex";


export const convert = (inputPython: string) => {
    return latex_primitives.begin_algorithm + "\n" + inputPython + "\n" + latex_primitives.end_algorithm
}


