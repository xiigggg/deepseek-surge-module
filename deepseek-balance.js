/**
 * DeepSeek 余额查询 - 定时脚本 (Cron)
 *
 * 每 N 小时自动查询 DeepSeek API 余额，写入持久化存储供 Panel 读取。
 * 余额低于阈值时推送通知。
 *
 * 参数格式: api_key=sk-xxx&threshold=5
 */

// --- 解析参数 ---
const argStr = typeof $argument !== "undefined" ? $argument : "";
const args = {};
argStr.split("&").forEach(pair => {
    const [k, v] = pair.split("=");
    if (k) args[k] = decodeURIComponent(v || "");
});

const API_KEY = args.api_key || "";
const THRESHOLD = parseFloat(args.threshold) || 5;

// --- 主逻辑 ---
if (!API_KEY) {
    $notification.post(
        "DeepSeek 余额查询",
        "⚠️ 未配置 API Key",
        "请在模块参数中填入 API_KEY"
    );
    $done();
}

const url = "https://api.deepseek.com/user/balance";

$httpClient.get(
    {
        url: url,
        headers: {
            "Accept": "application/json",
            "Authorization": "Bearer " + API_KEY,
        },
        timeout: 10,
    },
    function (error, response, data) {
        if (error) {
            console.log("[DeepSeek] 请求失败: " + error);
            $done();
            return;
        }

        try {
            const json = JSON.parse(data);
            const now = new Date().toISOString();

            // 存储原始响应供 panel 使用
            $persistentStore.write(data, "deepseek_balance_raw");
            $persistentStore.write(now, "deepseek_balance_time");

            // 解析余额
            if (json.balance_infos && json.balance_infos.length > 0) {
                const info = json.balance_infos[0];
                const total = parseFloat(info.total_balance);
                const granted = parseFloat(info.granted_balance);
                const toppedUp = parseFloat(info.topped_up_balance);

                // 存储各项余额
                $persistentStore.write(String(total), "deepseek_balance_total");
                $persistentStore.write(String(granted), "deepseek_balance_granted");
                $persistentStore.write(String(toppedUp), "deepseek_balance_topped_up");
                $persistentStore.write(info.currency, "deepseek_balance_currency");

                // 低余额告警
                if (total < THRESHOLD) {
                    $notification.post(
                        "💎 DeepSeek 余额不足",
                        "当前余额: ¥" + total.toFixed(2),
                        "赠送: ¥" + granted.toFixed(2) + " | 充值: ¥" + toppedUp.toFixed(2)
                    );
                }

                console.log("[DeepSeek] 余额: ¥" + total.toFixed(2) + " (阈值: ¥" + THRESHOLD + ")");
            } else if (!json.is_available) {
                $notification.post(
                    "💎 DeepSeek 余额查询",
                    "⚠️ 账户不可用",
                    "is_available = false，请检查账户状态"
                );
            }
        } catch (e) {
            console.log("[DeepSeek] 解析响应失败: " + e.message);
            console.log("[DeepSeek] 原始响应: " + data);
        }

        $done();
    }
);
