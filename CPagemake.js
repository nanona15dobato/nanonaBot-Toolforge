const { mwn } = require('mwn');
const bot = new mwn({
    apiUrl: 'https://ja.wikipedia.org/w/api.php',
    username: process.env.MW_USERNAME, // Botのユーザー名
    password: process.env.MW_PASSWORD, // Botのパスワード
    userAgent: 'nanonaBot/0.0.1 (Toolforge)',
    defaultParams: { format: 'json' }
});

async function getBotState() {
    try {
        const page = await bot.read('プロジェクト:カテゴリ関連/キュー/緊急停止');
        console.log(page?.revisions[0]);
        return page?.revisions[0]?.content || '';
    } catch (error) {
        console.error('Bot状態取得エラー:', error);
        return '';
    }
}

(async () => {
    await bot.login();
    const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
    jst.setDate(jst.getDate() + 1);
    
    const year = jst.getFullYear();
    const month = jst.getMonth() + 1;
    const day = jst.getDate();
    const pageTemplateTitle = 'プロジェクト:カテゴリ関連/議論/日別ページ雛形';
    const newPageTitle = `プロジェクト:カテゴリ関連/議論/${year}年/${month}月${day}日`;

    // Botの状態確認
    const botState = await getBotState();
    if (botState.includes('動作中')) {
        console.log('QueueBotは現在動作中です。');
        return;
    }

    // ページの存在確認
    const pageData = await bot.read(newPageTitle);
    console.log(pageData);
    if (pageData?.missing === undefined) {
        console.log(`ページ ${newPageTitle} はすでに存在します。`);
        return;
    }

    // テンプレートページの取得
    const templateData = await bot.read(pageTemplateTitle);
    console.log(templateData);
    const templateContent = templateData?.revisions[0]?.content;
    if (!templateContent) {
        console.log('テンプレートページの取得に失敗しました。');
        return;
    }

    // テンプレートの置換
    const newPageContent = templateContent
        .replace(/\{year\}/g, year)
        .replace(/\{month\}/g, month)
        .replace(/\{day\}/g, day)
        .replace(/\{page_name\}/g, newPageTitle);

    // ページの作成
    //await bot.edit(newPageTitle, newPageContent, 'Bot: 議論ページの作成 代理');
    console.log(newPageTitle, newPageContent, 'Bot: 議論ページの作成 代理');
})();
