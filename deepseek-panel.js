/**
 * DeepSeek 余额面板 - Panel 脚本
 *
 * 读取持久化存储中的余额数据，渲染为面板展示。
 * 支持手动刷新：点击面板即触发一次余额查询。
 *
 * 参数格式: api_key=sk-xxx&threshold=5
 */

(function () {
    // --- 解析参数 ---
    const argStr = typeof $argument !== "undefined" ? $argument : "";
    const args = {};
    argStr.split("&").forEach(pair => {
        const [k, v] = pair.split("=");
        if (k) args[k] = decodeURIComponent(v || "").replace(/^"|"$/g, "");
    });

    const API_KEY = args.api_key || "";
    const THRESHOLD = parseFloat(args.threshold) || 5;

    // --- 读取缓存 ---
    const total = $persistentStore.read("deepseek_balance_total");
    const granted = $persistentStore.read("deepseek_balance_granted");
    const toppedUp = $persistentStore.read("deepseek_balance_topped_up");
    const currency = $persistentStore.read("deepseek_balance_currency") || "CNY";
    const lastCheck = $persistentStore.read("deepseek_balance_time");

    const currencySymbol = currency === "CNY" ? "¥" : "$";

    // --- 面板渲染函数 ---
    function renderPanel(info, threshold, symbol) {
        const totalVal = parseFloat(info.total_balance);
        const isLow = totalVal < threshold;

        $done({
            title: "💎 DeepSeek",
            content: `${isLow ? "🔴" : "🟢"} 余额: ${symbol}${totalVal.toFixed(2)}`,
            icon: isLow ? "exclamationmark.triangle" : "dollarsign.circle",
            color: isLow ? "#ff6b6b" : "#4ecdc4",
        });
    }

    // --- 无缓存时主动请求 ---
    if (!total) {
        if (!API_KEY) {
            $done({
                title: "💎 DeepSeek 余额",
                content: "❌ 未配置 API Key\n\n请在模块参数中填入:\nAPI_KEY=sk-xxxxxxxxxxxxxxxx",
                icon: "exclamationmark.triangle",
                color: "#ff6b6b",
            });
            return;
        }

        // 发起请求获取余额
        $httpClient.get(
            {
                url: "https://api.deepseek.com/user/balance",
                headers: {
                    "Accept": "application/json",
                    "Authorization": "Bearer " + API_KEY,
                },
                timeout: 10,
            },
            function (error, response, data) {
                if (error) {
                    $done({
                        title: "💎 DeepSeek 余额",
                        content: "❌ 网络请求失败\n\n" + error,
                        icon: "wifi.slash",
                        color: "#ff6b6b",
                    });
                    return;
                }

                try {
                    const json = JSON.parse(data);
                    if (json.balance_infos && json.balance_infos.length > 0) {
                        const info = json.balance_infos[0];
                        $persistentStore.write(data, "deepseek_balance_raw");
                        $persistentStore.write(new Date().toISOString(), "deepseek_balance_time");
                        $persistentStore.write(String(info.total_balance), "deepseek_balance_total");
                        $persistentStore.write(String(info.granted_balance), "deepseek_balance_granted");
                        $persistentStore.write(String(info.topped_up_balance), "deepseek_balance_topped_up");
                        $persistentStore.write(info.currency, "deepseek_balance_currency");

                        renderPanel(info, THRESHOLD, currencySymbol);
                    } else {
                        $done({
                            title: "💎 DeepSeek 余额",
                            content: "⚠️ 无法解析余额\n\n原始响应:\n" + data.substring(0, 200),
                            icon: "questionmark.circle",
                            color: "#ffa500",
                        });
                    }
                } catch (e) {
                    $done({
                        title: "💎 DeepSeek 余额",
                        content: "⚠️ 解析失败\n\n" + e.message,
                        icon: "xmark.circle",
                        color: "#ff6b6b",
                    });
                }
            }
        );
        return;
    }

    // --- 有缓存时直接渲染 ---
    renderPanel(
        {
            total_balance: total,
            granted_balance: granted,
            topped_up: toppedUp,
            currency: currency,
        },
        THRESHOLD,
        currencySymbol
    );
})();
