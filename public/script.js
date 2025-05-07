// -----------------------------------
// 兽音加密/解密类 (包含修正后的 deConvert)
// -----------------------------------
class howlingAnimalsTranslator {
    __codeTxt = "嗷呜啊~"; // 默认编码字符

    constructor(codeTxt) {
        if (codeTxt != null) {
            codeTxt = codeTxt.trim();
            // 确保是4个字符，并且最好没有重复字符（虽然算法本身不强制）
            if (codeTxt.length === 4) {
                // 可选：增加重复字符检查
                // if (new Set(codeTxt).size === 4) {
                this.__codeTxt = codeTxt;
                // } else {
                //     console.warn("自定义兽音包含重复字符，可能导致解密不唯一或失败。使用默认值。");
                // }
            } else {
                console.warn("自定义兽音长度不为4，使用默认值 '嗷呜啊~'");
            }
        }
    }

    // 加密：文本 -> 兽音
    convert(txt) {
        txt = txt.trim();
        if (txt.length < 1) {
            return "";
        }
        // Prefix: 使用 codeTxt 的第 4, 2, 1 个字符 (索引 3, 1, 0)
        let result = this.__codeTxt[3] + this.__codeTxt[1] + this.__codeTxt[0];
        let offset = 0; // 偏移量，每次处理4bit后增加

        for (let i = 0; i < txt.length; i++) {
            let c = txt.charCodeAt(i); // 获取字符的 Unicode 码点

            // 处理每个字符的16位 (通常是 UTF-16)
            // 分成4个4位的块 (nibbles)
            for (let b = 12; b >= 0; b -= 4) {
                // 提取4位: (c >> b)
                // 应用偏移量并确保在 0-15 范围内: (... + offset++) & 15
                let hex = ((c >> b) + offset++) & 15; // 获取 0-15 的值

                // 将 4 位值 (hex) 映射到两个 codeTxt 字符
                // 高2位决定第一个字符: hex >> 2 (取值 0-3)
                result += this.__codeTxt[(hex >> 2)];
                // 低2位决定第二个字符: hex & 3 (取值 0-3)
                result += this.__codeTxt[(hex & 3)];
            }
        }
        // Suffix: 使用 codeTxt 的第 3 个字符 (索引 2)
        result += this.__codeTxt[2];
        return result;
    }

    // 解密：兽音 -> 文本 (修正版)
    deConvert(txt) {
        txt = txt.trim();
        // 基本校验: 必须有前缀(3) + 后缀(1) + 至少一个字符的编码(8) = 12
        if (txt.length < 12 || (txt.length - 4) % 8 !== 0) {
            console.error("输入兽音长度无效。");
            return ""; // 长度不符合规则
        }

        // 校验前缀和后缀是否匹配当前的 codeTxt
        if (txt[0] !== this.__codeTxt[3] || txt[1] !== this.__codeTxt[1] || txt[2] !== this.__codeTxt[0] || txt.charAt(txt.length - 1) !== this.__codeTxt[2]) {
            console.error("输入兽音的前缀或后缀与当前设定的兽音字符不匹配。");
            return "";
        }

        // 校验所有字符是否都在 codeTxt 中
        for (let char of txt) {
            if (this.__codeTxt.indexOf(char) === -1) {
                console.error(`输入兽音包含无效字符: "${char}"`);
                return "";
            }
        }


        let result = "";
        let offset = 0; // 偏移量，必须与加密时同步增长

        // 从前缀之后开始 (索引 3)，到后缀之前结束
        // 每次处理 8 个兽音字符 (代表一个原文)
        for (let i = 3; i < txt.length - 1; i += 8) {
            let charCode = 0; // 用于重建字符的 Unicode 码点

            // 处理构成一个原文字符的 8 个兽音字符 (4对)
            for (let j = 0; j < 4; j++) {
                let index1 = this.__codeTxt.indexOf(txt[i + j * 2]);     // 获取第一个兽音字符的索引 (0-3)
                let index2 = this.__codeTxt.indexOf(txt[i + j * 2 + 1]); // 获取第二个兽音字符的索引 (0-3)

                // 从两个索引重建 4 位值 (hex)
                let encodedNibble = (index1 << 2) | index2; // (0-15)

                // *** 逆向操作：减去加密时加上的偏移量 ***
                // 使用模运算确保结果非负且在正确范围
                let originalNibble = (encodedNibble - (offset % 16) + 16) & 15;

                // *** 同步增加偏移量，与加密过程保持一致 ***
                offset++;

                // 将解出的 4 位添加到 charCode (左移4位并或运算)
                charCode = (charCode << 4) | originalNibble;
            }
            // 将重建的 Unicode 码点转换为字符
            result += String.fromCharCode(charCode);
        }
        return result;
    }

    // // 识别函数，用于初步判断是否是此格式的兽音
    // identify(txt) {
    //     txt = txt.trim();
    //     // 长度检查: 至少 前缀(3)+后缀(1)+一个字符(8) = 12，且数据部分长度是8的倍数
    //     if (txt.length >= 12 && ((txt.length - 4) % 8) === 0) {
    //         // 检查前缀和后缀
    //         if (txt[0] === this.__codeTxt[3] && txt[1] === this.__codeTxt[1] && txt[2] === this.__codeTxt[0] && txt.charAt(txt.length - 1) === this.__codeTxt[2]) {
    //             // 检查所有字符是否都属于 codeTxt
    //             for (let i = 0; i < txt.length; i++) {
    //                 if (this.__codeTxt.indexOf(txt[i]) < 0) return false; // 发现无效字符
    //             }
    //             return true; // 通过所有检查
    //         }
    //     }
    //     return false; // 不满足条件
    // }
}

// -----------------------------------
// DOM 操作和事件监听
// -----------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const codecInput = document.getElementById('codec');
    const encryptBtn = document.getElementById('encryptBtn');
    const decryptBtn = document.getElementById('decryptBtn');
    const copyBtn = document.getElementById('copyBtn');
    const codecError = document.getElementById('codec-error');
    const copyStatus = document.getElementById('copy-status');

    let currentTranslator = new howlingAnimalsTranslator(codecInput.value); // 初始化转换器

    // 更新转换器实例（当自定义兽音变化时）
    function updateTranslator() {
        const codecValue = codecInput.value.trim();
        codecError.textContent = ''; // 清除旧错误
        if (codecValue.length !== 4) {
            codecError.textContent = '必须输入4个字符！将使用默认值。';
            // 可以选择在这里强制使用默认值或上一次有效的值
            currentTranslator = new howlingAnimalsTranslator("嗷呜啊~"); // 使用默认
        } else if (new Set(codecValue).size !== 4) {
            codecError.textContent = '字符不能重复！可能影响解密。';
            // 即使重复，也允许创建实例，但给出警告
            currentTranslator = new howlingAnimalsTranslator(codecValue);
        }
        else {
            currentTranslator = new howlingAnimalsTranslator(codecValue);
        }
        // console.log("Translator updated with codec:", currentTranslator.__codeTxt); // 调试信息
    }

    // 当自定义兽音输入框失去焦点或按下回车时更新转换器
    codecInput.addEventListener('blur', updateTranslator);
    codecInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            updateTranslator();
            codecInput.blur(); // 触发 blur 事件以确保更新
        }
    });

    // 加密按钮点击事件
    encryptBtn.addEventListener('click', () => {
        updateTranslator(); //确保使用最新的自定义兽音
        const textToEncrypt = inputText.value;
        if (!textToEncrypt) {
            outputText.value = ''; // 清空输出
            return;
        }
        try {
            outputText.value = currentTranslator.convert(textToEncrypt);
            copyStatus.textContent = ''; // 清除复制状态
        } catch (error) {
            console.error("加密出错:", error);
            outputText.value = "加密过程中发生错误，请检查输入和控制台。";
        }
    });

    // 解密按钮点击事件
    decryptBtn.addEventListener('click', () => {
        updateTranslator(); //确保使用最新的自定义兽音
        const textToDecrypt = inputText.value;
        if (!textToDecrypt) {
            outputText.value = ''; // 清空输出
            return;
        }

        // 用 identify 做初步检查
        // if (!currentTranslator.identify(textToDecrypt)) {
        //     outputText.value = "输入内容看起来不像用当前设置生成的兽音。";
        //     return;
        // }

        try {
            const decryptedText = currentTranslator.deConvert(textToDecrypt);
            if (decryptedText === "" && textToDecrypt.length > 0) {
                // deConvert 内部校验失败会返回空字符串
                outputText.value = "解密失败。请检查输入的兽音是否完整、是否与当前自定义兽音匹配。";
            } else {
                outputText.value = decryptedText;
            }
            copyStatus.textContent = ''; // 清除复制状态
        } catch (error) {
            console.error("解密出错:", error);
            outputText.value = "解密过程中发生错误，请检查输入和控制台。";
        }

    });

    // 复制按钮点击事件
    copyBtn.addEventListener('click', () => {
        if (outputText.value) {
            navigator.clipboard.writeText(outputText.value)
                .then(() => {
                    copyStatus.textContent = '已复制！';
                    // 让提示信息短暂显示后消失
                    setTimeout(() => {
                        copyStatus.textContent = '';
                    }, 2000);
                })
                .catch(err => {
                    console.error('无法复制文本: ', err);
                    copyStatus.textContent = '复制失败';
                    setTimeout(() => {
                        copyStatus.textContent = '';
                    }, 2000);
                });
        } else {
            copyStatus.textContent = '没有内容可复制';
            setTimeout(() => {
                copyStatus.textContent = '';
            }, 2000);
        }
    });

    // 初始化时检查一次 codec 输入
    updateTranslator();

}); // End of DOMContentLoaded listener