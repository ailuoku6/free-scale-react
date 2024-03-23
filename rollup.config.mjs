import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';

export default {
    input: 'src/hooks/use-free-scale.ts', // 指定入口文件
    output: {
        file: 'dist/hooks/use-free-scale.js', // 指定输出文件
        format: 'esm', // 指定输出格式,
        name: 'useFreeScale',
    },
    plugins: [typescript(), terser()], // 使用 TypeScript 插件
};
