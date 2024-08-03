import { useState } from 'react';
import { ReactP5Wrapper } from 'react-p5-wrapper';
import './App.css';
import { headNameReplace, Scanner } from "./parse";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { sketch_gamma, sketch_input, sketch_output } from './picture';
import { Hyouki, strT, less_than, Options, T, Z, termToString, term_to_string_gamma } from './intersection';
import { switchFunc } from './junction';

type Operation = "fund" | "dom" | "less_than";

function App() {
  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");
  const [selected, setSelected] = useState("G");
  const [output, setOutput] = useState("入力：\n\n出力：");
  const [outputObject, setOutputObject] = useState<T>(Z);
  const [outputGamma, setOutputGamma] = useState<T | null>(null);
  const [outputError, setOutputError] = useState("");
  const [options, setOptions] = useState<Options>({
    checkOnOffo: false,
    checkOnOffO: false,
    checkOnOffA: false,
    checkOnOffB: false,
    checkOnOffC: false,
    checkOnOffp: false,
    checkOnOffT: false,
  });
  const [showHide, setShowHide] = useState(false);
  const [inputHeadSize, setinputHeadSize] = useState(50);
  const [inputHeadRange, setinputHeadRange] = useState(50);
  const [inputHeadHeight, setinputHeadHeight] = useState(50);

  const compute = (operation: Operation) => {
    setOutput("");
    setOutputError("");
    setOutputObject(Z);
    setOutputGamma(null);
    try {
      const x = new Scanner(inputA, selected).parse_term();
      const y = inputB ? new Scanner(inputB, selected).parse_term() : null;

      const inputStrx = termToString(x, options, selected);
      let inputStry: string;
      let inputStr: string;
      if (operation === "less_than") {
        if (y === null) throw Error("Bの入力が必要です");
        inputStry = termToString(y, options, selected);
        inputStr = options.checkOnOffT ? `入力：$${inputStrx} \\lt ${inputStry}$` : `入力：${inputStrx} < ${inputStry}`;
        setOutput(`${inputStr}\n\n出力：${less_than(x, y) ? "真" : "偽"}`);
        return;
      }

      const func: Hyouki = switchFunc(selected);
      const result: strT = (() => {
        switch (operation) {
          case "fund":
            if (y === null) throw Error("Bの入力が必要です");
            inputStry = termToString(y, options, selected);
            inputStr = options.checkOnOffT ? `入力：$${inputStrx}[${inputStry}]$` : `入力：${inputStrx}[${inputStry}]`;
            return func.fund(x, y);
          case "dom":
            inputStr = options.checkOnOffT ? `入力：$\\textrm{dom}(${inputStrx})$` : `入力：dom(${inputStrx})`;
            return func.dom(x);
          default:
            throw new Error("不明な操作");
        }
      })();

      let strTerm = termToString(result.term, options, selected);
      strTerm = `\n\n出力：${options.checkOnOffT ? `$${strTerm}$` : strTerm}`;
      let strGamma = ``;
      if (result.gamma) {
        strGamma = term_to_string_gamma(result.gamma, options, selected);
        strGamma = `\n\nBadpart：${options.checkOnOffT ? `$${strGamma}$` : strGamma}`;
      }

      setOutputObject(result.term);
      setOutputGamma(result.gamma);

      setOutput(`${inputStr}${strGamma}${strTerm}`);
    } catch (error) {
      if (error instanceof Error) setOutputError(error.message);
      else setOutputError("不明なエラー");
      console.error("Error in compute:", error);
    }
  };

  const handleCheckboxChange = (key: keyof Options) => {
    setOptions((prevOptions) => ({
      ...prevOptions,
      [key]: !prevOptions[key],
    }));
  };

  return (
    <div className="app">
      <header>2変数配列表記計算機</header>
      <main>
        <p className="rdm">
          入力はψ(a,b), ψ_&#123;a&#125;(b)の形式で行ってください。<br />
          a=0の時はψ(b)としても大丈夫です。<br />
          {selected !== "ψ" && <>ψは{selected}としても大丈夫です。<br /></>}
          _, &#123;, &#125;は省略可能です。<br />
          略記として、1 := ψ(0,0), n := 1 + 1 + ...(n個の1)... + 1, ω := ψ(0,1), Ω := ψ(1,0)が使用可能。<br />
          また、ψは"p"で、{selected !== "ψ" && <>または{selected}は"{headNameReplace(selected)}"で、</>}ωはwで、ΩはWで代用可能です。
        </p>
        A:
        <input
          className="input is-primary"
          value={inputA}
          onChange={(e) => setInputA(e.target.value)}
          type="text"
          placeholder="入力A"
        />
        B:
        <input
          className="input is-primary"
          value={inputB}
          onChange={(e) => setInputB(e.target.value)}
          type="text"
          placeholder="入力B"
        />
        <div className="block">
          <button className="button is-primary" onClick={() => compute("fund")}>
            A[B]を計算
          </button>
          <button className="button is-primary" onClick={() => compute("dom")}>
            dom(A)を計算
          </button>
          <button className="button is-primary" onClick={() => compute("less_than")}>
            A &lt; Bか判定
          </button>
          <div className="select is-rounded">
            <select value={selected} onChange={e => setSelected(e.target.value)}>
              <option value="〇">〇関数</option>
              <option value="亜">亜関数</option>
              <option value="伊">伊関数</option>
              <option value="胃">胃関数</option>
              <option value="亞">亞関数</option>
              <option value="B">B関数</option>
              <option value="ψ">ブーフホルツのψ関数</option>
              <option value="G">Goal関数</option>
              <option value="竹">横竹関数</option>
              <option value="茸">横茸関数</option>
            </select>
          </div>
        </div>
        <input type="button" value="オプション" onClick={() => setShowHide(!showHide)} className="button is-primary is-light is-small" />
        {showHide && (
          <ul>
            <li><label className="checkbox">
              <input type="checkbox" checked={options.checkOnOffo} onChange={() => handleCheckboxChange('checkOnOffo')} />
              &nbsp;{options.checkOnOffp ? "ψ" : selected}(0,1)をωで出力
            </label></li>
            <li><label className="checkbox">
              <input type="checkbox" checked={options.checkOnOffO} onChange={() => handleCheckboxChange('checkOnOffO')} />
              &nbsp;{options.checkOnOffp ? "ψ" : selected}(1,0)をΩで出力
            </label></li>
            <li><label className="checkbox">
              <input type="checkbox" checked={options.checkOnOffA} onChange={() => handleCheckboxChange('checkOnOffA')} />
              &nbsp;{options.checkOnOffp ? "ψ" : selected}(a,b)を{options.checkOnOffp ? "ψ" : selected}_a(b)で表示
            </label></li>
            {options.checkOnOffA && (
              <li><ul><li><label className="checkbox">
                <input type="checkbox" checked={options.checkOnOffB} onChange={() => handleCheckboxChange('checkOnOffB')} />
                &nbsp;全ての&#123; &#125;を表示
              </label></li></ul></li>
            )}
            <li><label className="checkbox">
              <input type="checkbox" checked={options.checkOnOffC} onChange={() => handleCheckboxChange('checkOnOffC')} />
              &nbsp;{options.checkOnOffp ? "ψ" : selected}(0,b)を{options.checkOnOffp ? "ψ" : selected}(b)で表示
            </label></li>
            {selected !== "ψ" && (
              <li><label className="checkbox">
                <input type="checkbox" checked={options.checkOnOffp} onChange={() => handleCheckboxChange('checkOnOffp')} />
                &nbsp;{selected}をψで表示
              </label></li>
            )}
            <li><label className="checkbox">
              <input type="checkbox" checked={options.checkOnOffT} onChange={() => handleCheckboxChange('checkOnOffT')} />
              &nbsp;TeXで出力
            </label></li>
          </ul>
        )}
        <div className="box is-primary">
          {outputError !== "" ? (
            <div className="notification is-danger">{outputError}</div>
          ) : (
            <div>
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {output}
              </ReactMarkdown>
            </div>
          )}
        </div>
        <div className='hydra'>
          ノードの大きさ：
          <input
            className="hydraSize"
            value={inputHeadSize}
            onChange={(e) => setinputHeadSize(parseInt(e.target.value))}
            min="0"
            max="200"
            type="range"
          /><br />
          ノード間の距離：
          <input
            className="hydraSize"
            value={inputHeadRange}
            onChange={(e) => setinputHeadRange(parseInt(e.target.value))}
            min="0"
            max="200"
            type="range"
          /><br />
          ノード間の高さ：
          <input
            className="hydraSize"
            value={inputHeadHeight}
            onChange={(e) => setinputHeadHeight(parseInt(e.target.value))}
            min="0"
            max="200"
            type="range"
          />
        </div>
        <div className='sketchCanvas'>
          <ReactP5Wrapper sketch={sketch_input} inputstr={inputA} headSize={inputHeadSize} headRange={inputHeadRange} headHeight={inputHeadHeight} headname={selected} />
          <ReactP5Wrapper sketch={sketch_gamma} gamma={outputGamma} headSize={inputHeadSize} headRange={inputHeadRange} headHeight={inputHeadHeight} />
          <ReactP5Wrapper sketch={sketch_output} output={outputObject} headSize={inputHeadSize} headRange={inputHeadRange} headHeight={inputHeadHeight} />
        </div>
      </main>
      <footer>
        <a href="https://googology.fandom.com/ja/wiki/%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC%E3%83%96%E3%83%AD%E3%82%B0:Naruyoko/%EF%BC%9F%E2%86%92%CF%86%E2%86%92%CF%88%E2%86%92%E4%B8%89#2%E5%A4%89%E6%95%B0%E3%80%87%E9%96%A2%E6%95%B0" target="_blank" rel="noreferrer">Definition of "〇 Function"</a> by <a href="https://googology.fandom.com/ja/wiki/%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC:Naruyoko" target="_blank" rel="noreferrer">Naruyoko</a>, Retrieved 2024/07/18 <br />
        <a href="https://googology.fandom.com/ja/wiki/%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC%E3%83%96%E3%83%AD%E3%82%B0:P%E9%80%B2%E5%A4%A7%E5%A5%BD%E3%81%8Dbot/%E6%8B%A1%E5%BC%B5Buchholz_OCF%E3%81%AB%E4%BC%B4%E3%81%86%E9%A0%86%E5%BA%8F%E6%95%B0%E8%A1%A8%E8%A8%98" target="_blank" rel="noreferrer">Definition of "Ordinal Notation Associated to Extended Buchholz's OCF"</a> by <a href="https://googology.fandom.com/ja/wiki/%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC:P%E9%80%B2%E5%A4%A7%E5%A5%BD%E3%81%8Dbot" target="_blank" rel="noreferrer">p進大好きbot</a>, Retrieved 2024/07/18 <br />
        <a href="https://googology.fandom.com/ja/wiki/%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC%E3%83%96%E3%83%AD%E3%82%B0:%E7%AB%B9%E5%8F%96%E7%BF%81/%E3%83%96%E3%83%AD%E3%82%B0%E8%A8%98%E4%BA%8B%E3%81%BE%E3%81%A8%E3%82%81" target="_blank" rel="noreferrer">Definition of other functions</a> by <a href="https://googology.fandom.com/ja/wiki/%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC:%E7%AB%B9%E5%8F%96%E7%BF%81" target="_blank" rel="noreferrer">竹取翁</a>, Retrieved 2024/07/18 <br />
        The program <a href="https://github.com/SanukiMiyatsuko/two_variables_array_notation" target="_blank" rel="noreferrer">https://github.com/SanukiMiyatsuko/two_variables_array_notation</a> is licensed by <a href="https://creativecommons.org/licenses/by-sa/3.0/legalcode" target="_blank" rel="noreferrer">Creative Commons Attribution-ShareAlike 3.0 Unported License</a>.<br />
        Last updated: 2024/07/21
      </footer>
    </div>
  );
}

export default App;