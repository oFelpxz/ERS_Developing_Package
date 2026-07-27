import { readFileSync, readdirSync } from "node:fs";

// Palavras reservadas do GLSL ES (1.00 + 3.00). Drivers variam em quais delas
// rejeitam, entao tratamos todas como proibidas.
const RESERVED = `active asm attribute cast class common default double dvec2 dvec3 dvec4
enum extern external filter fixed flat fvec2 fvec3 fvec4 goto half hvec2 hvec3 hvec4
inline input interface long namespace noinline noperspective output packed partition
patch public resource restrict row_major sample sampler3DRect shared short sizeof
static subroutine superp switch template this typedef union unsigned using varying
volatile coherent readonly writeonly precise`.split(/\s+/);

const dir = "src/components/globe";

function collect(src, key) {
  const found = [];
  let i = 0;
  for (;;) {
    const k = src.indexOf(key + ": /* glsl */ `", i);
    if (k === -1) break;
    const start = k + (key + ": /* glsl */ `").length;
    const end = src.indexOf("`", start);
    found.push({ body: src.slice(start, end), offset: start });
    i = end + 1;
  }
  return found;
}

let achados = 0;
for (const f of readdirSync(dir).filter((x) => x.endsWith(".tsx"))) {
  const src = readFileSync(`${dir}/${f}`, "utf8");
  for (const key of ["vertexShader", "fragmentShader"]) {
    for (const { body } of collect(src, key)) {
      // ignora comentarios: so interessa codigo
      const code = body.replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
      for (const w of RESERVED) {
        // uso como identificador: declaracao ou atribuicao
        const re = new RegExp(`\\b(?:float|int|vec[234]|mat[234]|bool)\\s+${w}\\b|\\b${w}\\s*=`, "g");
        const m = code.match(re);
        if (m) {
          console.log(`${f} / ${key}: palavra reservada "${w}" usada como identificador -> ${m[0]}`);
          achados++;
        }
      }
    }
  }
}

if (achados === 0) {
  console.log("check:glsl — OK, nenhuma palavra reservada");
} else {
  // Falha o build de proposito: nem o tsc nem o eslint enxergam GLSL, e o
  // shader quebra em runtime apenas em alguns drivers — passa despercebido
  // na maquina de quem escreveu e falha na de quem usa.
  console.error(`\ncheck:glsl — ${achados} ocorrencia(s). Renomeie o identificador.`);
  process.exit(1);
}
