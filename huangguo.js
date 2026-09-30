/**
 * 黄果短剧 · drpy2 规则源（字符串 js: 模式）
 * 适用：TVBox / 影视仓 / EasyBox / 海阔视界 / ZYPlayer / OK影视
 *
 * 注意：必须搭配 2024-04-26 及以后的 drpy2 引擎（3.9.49beta40+，带 lazy 免嗅）。
 * 旧版引擎（如 3.9.49beta2）不支持 lazy，播放会失败。
 *
 * 由 Forward 模块 forward.huangguoai.tut.js (v1.5.1) 移植，接口契约一致：
 *   列表   GET /api/videos?page=N&page_size=24&sort=hot|new
 *   排行榜 GET /api/ranks/hot?page=N
 *   搜索   GET /api/search?q=KW&page=N
 *   详情   GET /api/videos/{id}
 *   播放   GET /api/videos/{id}/play?ep=N
 * 该站封面是 AES 密文，必须走解密代理才能显示，见 CP。
 */

var CATS = [
  ['热门', 'hot'], ['最新', 'new'], ['排行榜', 'rank'],
  ['AI换脸', 'k1'], ['AI魔改', 'k2'], ['短剧', 'k3'], ['漫剧', 'k4'],
  ['都市', 'k5'], ['现代', 'k6'], ['校园', 'k7'], ['乡村', 'k8'],
  ['古风', 'k9'], ['穿越', 'k10'], ['重生', 'k11'], ['系统', 'k12'],
  ['修仙', 'k13'], ['后宫', 'k14'], ['赘婿', 'k15'], ['逆袭', 'k16'],
  ['霸总', 'k17'], ['豪门', 'k18'], ['甜宠', 'k19'], ['虐恋', 'k20'],
  ['熟女', 'k21'], ['乱伦', 'k22'], ['母子', 'k23'], ['人妻', 'k24'],
  ['巨乳', 'k25'], ['黑丝', 'k26'], ['办公室', 'k27']
];

// 每段 js: 代码都会带上这份公共代码，避免依赖外部作用域
var H = [
  "var H='https://huangguoai.com';",
  "var CP='https://huangguo.wulii.de5.net';",
  "var CT='hg8f3a2c91b7e04d6a';",
  "var HEADERS={'User-Agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15','Referer':H+'/','Accept':'application/json, text/plain, */*'};",
  "var KW={k1:'AI换脸',k2:'AI魔改',k3:'短剧',k4:'漫剧',k5:'都市',k6:'现代',k7:'校园',k8:'乡村',k9:'古风',k10:'穿越',k11:'重生',k12:'系统',k13:'修仙',k14:'后宫',k15:'赘婿',k16:'逆袭',k17:'霸总',k18:'豪门',k19:'甜宠',k20:'虐恋',k21:'熟女',k22:'乱伦',k23:'母子',k24:'人妻',k25:'巨乳',k26:'黑丝',k27:'办公室'};",
  "function _t(v){return String(v==null?'':v).trim();}",
  "function _isArr(x){return Object.prototype.toString.call(x)==='[object Array]';}",
  "function _json(s){if(!s)return null;try{return JSON.parse(s);}catch(e){return null;}}",
  "function _items(d){if(!d)return [];var x=(d&&d.data!=null)?d.data:d;if(_isArr(x))return x;if(x&&_isArr(x.items))return x.items;if(x&&_isArr(x.list))return x.list;if(x&&_isArr(x.results))return x.results;return [];}",
  "function _cov(c){c=_t(c);if(!c)return '';if(/^https?:\\/\\//i.test(c))return c;if(c.indexOf('//')===0)return 'https:'+c;var enc=H+(c[0]==='/'?'':'/')+c;if(!CP)return enc;var u=CP+'/?url='+encodeURIComponent(enc);if(CT)u+='&token='+encodeURIComponent(CT);return u;}",
  "function _vod(it){var id=_t(it.id!=null?it.id:(it.video_id!=null?it.video_id:it.vod_id));if(!id)return null;var title=_t(it.title||it.vod_name||it.name)||id;var ep=it.episode_count!=null?it.episode_count:it.total_episodes;var remark='';if(it.is_finished)remark='全'+(ep==null?'':ep)+'集';else if(ep)remark='更新至'+ep+'集';return {url:id,title:title,pic_url:_cov(it.cover||it.vod_pic||it.pic||''),desc:remark};}",
  "function _map(list){var o=[];for(var i=0;i<list.length;i++){var v=_vod(list[i]);if(v)o.push(v);}return o;}",
  "function _q(s){var i=s.indexOf('?');var q={};if(i<0)return q;s.slice(i+1).split('&').forEach(function(kv){if(!kv)return;var p=kv.split('=');q[decodeURIComponent(p[0])]=decodeURIComponent((p[1]||'').replace(/\\+/g,' '));});return q;}",
  "function _collect(kw,pg,strict){var out=[],seen={};var max=strict?pg+2:pg;for(var p=pg;p<=max;p++){var b=_items(_json(request(H+'/api/search?q='+encodeURIComponent(kw)+'&page='+p)));if(!b.length)break;for(var i=0;i<b.length;i++){var it=b[i];var id=_t(it.id!=null?it.id:it.video_id);if(!id||seen[id])continue;if(strict){var hit=false;var tg=it.tags||[];if(_isArr(tg)){for(var j=0;j<tg.length;j++){if(String(tg[j])===kw){hit=true;break;}}}if(!hit&&_t(it.title).indexOf(kw)===0)hit=true;if(!hit)continue;}seen[id]=1;out.push(it);}if(out.length>=24)break;}return out.slice(0,24);}"
].join('\n');

var BODY_HOME = [
  "var out=_items(_json(request(H+'/api/videos?page=1&page_size=24&sort=hot')));",
  "setResult(_map(out));"
].join('\n');

var BODY_CATE = [
  "var _p=_q(input);",
  "var tid=_p.x||'hot';",
  "var pg=parseInt(_p.page||'1')||1;",
  "var out=[];",
  "if(tid==='rank'){out=_items(_json(request(H+'/api/ranks/hot?page='+pg)));}",
  "else if(KW[tid]){out=_collect(KW[tid],pg,true);}",
  "else{out=_items(_json(request(H+'/api/videos?page='+pg+'&page_size=24&sort='+(tid==='new'?'new':'hot'))));}",
  "setResult(_map(out));"
].join('\n');

var BODY_SEARCH = [
  "var _p=_q(input);",
  "var kw=_t(_p.q);",
  "var pg=parseInt(_p.page||'1')||1;",
  "if(!kw){setResult([]);}else{setResult(_map(_collect(kw,pg,false)));}"
].join('\n');

var BODY_DETAIL = [
  "var id=_t(input);",
  "var d=_json(request(H+'/api/videos/'+encodeURIComponent(id)));",
  "var data=(d&&d.data)||{};",
  "var eps=_isArr(data.episodes)?data.episodes:[];",
  "var arr=[];",
  "if(eps.length){for(var i=0;i<eps.length;i++){var n=eps[i].ep_num!=null?eps[i].ep_num:(eps[i].episode!=null?eps[i].episode:i+1);var nm=_t(eps[i].title)||('第'+n+'集');arr.push(nm+'$'+id+'@'+n);}}",
  "else{arr.push('第1集$'+id+'@1');}",
  "LISTS=[arr];"
].join('\n');

var BODY_LAZY = [
  "var s=_t(input);",
  "var ps=s.split('@');",
  "var id=_t(ps[0]);",
  "var ep=_t(ps[1])||'1';",
  "var d=_json(request(H+'/api/videos/'+encodeURIComponent(id)+'/play?ep='+encodeURIComponent(ep)));",
  "var u=(d&&d.data&&d.data.video_url)||(d&&d.video_url)||'';",
  "if(u){input={parse:0,jx:0,url:u,headers:HEADERS};}"
].join('\n');

var rule = {
  类型: '影视',
  title: '黄果短剧',
  host: 'https://huangguoai.com',
  homeUrl: '/api/videos?page=1&page_size=24&sort=hot&x=hot',
  url: '/api/videos?page=fypage&page_size=24&sort=hot&x=fyclass',
  searchUrl: '/api/search?q=**&page=fypage',
  class_name: CATS.map(function (c) { return c[0]; }).join('&'),
  class_url: CATS.map(function (c) { return c[1]; }).join('&'),
  headers: {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    'Referer': 'https://huangguoai.com/',
    'Accept': 'application/json, text/plain, */*'
  },
  timeout: 10000,
  play_parse: true,
  searchable: 1,
  quickSearch: 1,
  filterable: 0,
  limit: 24,

  推荐: 'js:' + H + '\n' + BODY_HOME,
  一级: 'js:' + H + '\n' + BODY_CATE,
  搜索: 'js:' + H + '\n' + BODY_SEARCH,

  二级: {
    tabs: 'js:TABS=["黄果"]',
    lists: 'js:' + H + '\n' + BODY_DETAIL
  },

  lazy: 'js:' + H + '\n' + BODY_LAZY
};
