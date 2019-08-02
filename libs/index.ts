import 'tslib'
// tinysegmenterとtextファイルを読み込む
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Segmenter = require('tiny-segmenter')
interface Morpheme {
    [key: string]: string[];
}
interface TinySegmenter {
    segment: (text: string) => string;
}
/**
 * @example
 * ```typescript
 * const markov = new MarkovChain('こんにちは');
 * const sentence = markov.makeSentence()
 * console.log(sentence)
 * ```
 */
class MarkovChain {
    private dict: Morpheme

    private segmenter: TinySegmenter

    public constructor (data: string, segmenter: TinySegmenter = new Segmenter()) {
        this.segmenter = segmenter
        this.dict = this.makeDic(data)
    }

    private nonoise (morphemes: string): string {
        morphemes = morphemes.replace(/\n/g, '。')
        morphemes = morphemes.replace(/[?!？！]/g, '。')
        morphemes = morphemes.replace(/[-|｜:：・]/g, '。')
        morphemes = morphemes.replace(/[「」（）()[\]【】]/g, ' ')
        return morphemes
    }

    private makeDic (data: string): Morpheme {
        const morphemes = this.nonoise(data)
        const lines = morphemes.split('。')
        const morpheme: Morpheme = {}
        for (let i = 0; i <= lines.length - 1; i++) {
            const words = this.segmenter.segment(lines[i])
            if (!morpheme['_BOS_']) { morpheme['_BOS_'] = [] }
            if (words[0]) { morpheme['_BOS_'].push(words[0]) };// 文頭
            for (let w = 0; w <= words.length - 1; w++) {
                const nowWord = words[w]// 今の単語
                let nextWord = words[w + 1]// 次の単語
                if (nextWord === undefined) { // 文末
                    nextWord = '_EOS_'
                }
                if (!morpheme[nowWord]) {
                    morpheme[nowWord] = []
                }
                morpheme[nowWord].push(nextWord)
                if (nowWord === '、') { // 「、」は文頭として使える。
                    morpheme['_BOS_'].push(nextWord)
                }
            }
        }
        return morpheme
    }

    /**
     * Create sentence by markov chain
     * @return {string}
     * @example
     * ```typescript
     * const markov = new MarkovChain('こんにちは');
     * const sentence = markov.makeSentence()
     * console.log(sentence)
     * ```
     */
    public makeSentence (): string {
        const morpheme: Morpheme = this.dict
        let nowWord = ''
        let morphemes = ''
        nowWord = morpheme['_BOS_'][Math.floor(Math.random() * morpheme['_BOS_'].length)]
        morphemes += nowWord
        while (nowWord !== '_EOS_') {
            nowWord = morpheme[nowWord][Math.floor(Math.random() * morpheme[nowWord].length)]
            morphemes += nowWord
        }
        morphemes = morphemes.replace(/_EOS_$/, '。')
        return morphemes
    }
}
export default MarkovChain
