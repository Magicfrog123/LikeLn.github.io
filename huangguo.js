/**
 * 黄果短剧 · drpy 规则源
 * 适用：TVBox / 影视仓 / EasyBox / 海阔视界 / ZYPlayer / OK影视（需内置 drpy2 或 drpyS 引擎）
 *
 * 由 Forward 模块 forward.huangguoai.tut.js (v1.5.1) 移植，接口契约完全一致：
 *   列表   GET /api/videos?page=N&page_size=24&sort=hot|new
 *   排行榜 GET /api/ranks/hot?page=N
 *   搜索   GET /api/search?q=KW&page=N
 *   详情   GET /api/videos/{id}
 *   播放   GET /api/videos/{id}/play?ep=N
 * 该站封面是 AES 密文，必须走解密代理才能在 App 里显示，见 COVER_PROXY。
 *
 * 用法：把本文件托管到任意可访问 URL（GitHub raw / Gist / 静态空间均可），
 *      然后在 App 的接口配置里加一个站点：
 *      { "name": "黄果", "key": "huangguo", "type": 3,
 *        "api": "https://notabug.org/fantaiying/ext/raw/main/drpy2.min.js",
 *        "ext": "https://你的地址/huangguo.js",
 *        "searchable": 1, "quickSearch": 1, "filterable": 0 }
 */

var HOST = 'https://huangguoai.com';
var COVER_PROXY = 'https://huangguo.wulii.de5.net';
var COVER_TOKEN = 'hg8f3a2c91b7e04d6a';
var UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15';
var HEADERS = {
  'User-Agent': UA,
  'Referer': HOST + '/',
  'Accept': 'application/json, text/plain, */*'
};

// 站点没有真分类接口，分类=关键词搜索后按 tags/标题前缀过滤（与原脚本一致）
var KW = {
  k1: 'AI换脸', k2: 'AI魔改', k3: '短剧', k4: '漫剧', k5: '都市',
  k6: '现代', k7: '校园', k8: '乡村', k9: '古风', k10: '穿越',
  k11: '重生', k12: '系统', k13: '修仙', k14: '后宫', k15: '赘婿',
  k16: '逆袭', k17: '霸总', k18: '豪门', k19: '甜宠', k20: '虐恋',
  k21: '熟女', k22: '乱伦', k23: '母子', k24: '人妻', k25: '巨乳',
  k26: '黑丝', k27: '办公室'
};

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

function t(v) { return String(v == null ? '' : v).trim(); }

function absUrl(u) {
  var s = t(u);
  if (s && s.indexOf('/') === 0) s = HOST + s;
  return s;
}

function query(s) {
  var q = {};
  var i = s.indexOf('?');
  if (i < 0) return q;
  s.slice(i + 1).split('&').forEach(function (kv) {
    if (!kv) return;
    var p = kv.split('=');
    q[decodeURIComponent(p[0])] = decodeURIComponent((p[1] || '').replace(/\+/g, ' '));
  });
  return q;
}

function absCover(c) {
  c = t(c);
  if (!c) return '';
  if (/^https?:\/\//i.test(c)) return c;
  if (c.indexOf('//') === 0) return 'https:' + c;
  return HOST + (c[0] === '/' ? '' : '/') + c;
}

function cover(c) {
  var enc = absCover(c);
  if (!enc) return '';
  if (!COVER_PROXY) return enc;
  var u = COVER_PROXY.replace(/\/+$/, '') + '/?url=' + encodeURIComponent(enc);
  if (COVER_TOKEN) u += '&token=' + encodeURIComponent(COVER_TOKEN);
  return u;
}

async function getJson(url) {
  var r = await request(url, HEADERS);
  if (r == null) return null;
  if (typeof r === 'string') {
    try { return JSON.parse(r); } catch (e) { return null; }
  }
  return r;
}

function items(d) {
  if (!d) return [];
  var x = (d && d.data != null) ? d.data : d;
  if (Object.prototype.toString.call(x) === '[object Array]') return x;
  if (Object.prototype.toString.call(x.items) === '[object Array]') return x.items;
  if (Object.prototype.toString.call(x.list) === '[object Array]') return x.list;
  if (Object.prototype.toString.call(x.results) === '[object Array]') return x.results;
  return [];
}

function toVod(it) {
  var id = t(it.id != null ? it.id : (it.video_id != null ? it.video_id : it.vod_id));
  if (!id) return null;
  var title = t(it.title || it.vod_name || it.name) || id;
  var pic = cover(it.cover || it.vod_pic || it.pic || '');
  var ep = it.episode_count != null ? it.episode_count : it.total_episodes;
  var remark = '';
  if (it.is_finished) remark = '全' + (ep == null ? '' : ep) + '集';
  else if (ep) remark = '更新至' + ep + '集';
  return {
    vod_id: id,
    vod_name: title,
    vod_pic: pic,
    vod_remarks: remark,
    url: id,
    title: title,
    pic_url: pic,
    desc: remark
  };
}

function pack(list) {
  var out = [];
  for (var i = 0; i < list.length; i++) {
    var v = toVod(list[i]);
    if (v) out.push(v);
  }
  return out;
}

async function collect(kw, pg, strict) {
  var out = [], seen = {};
  var max = strict ? pg + 2 : pg;
  for (var p = pg; p <= max; p++) {
    var d = await getJson(HOST + '/api/search?q=' + encodeURIComponent(kw) + '&page=' + p);
    var batch = items(d);
    if (!batch.length) break;
    for (var i = 0; i < batch.length; i++) {
      var it = batch[i];
      var id = t(it.id != null ? it.id : it.video_id);
      if (!id || seen[id]) continue;
      if (strict) {
        var hit = false;
        var tags = it.tags || [];
        if (Object.prototype.toString.call(tags) === '[object Array]') {
          for (var j = 0; j < tags.length; j++) {
            if (String(tags[j]) === kw) { hit = true; break; }
          }
        }
        if (!hit && t(it.title).indexOf(kw) === 0) hit = true;
        if (!hit) continue;
      }
      seen[id] = 1;
      out.push(it);
    }
    if (out.length >= 24) break;
  }
  return out.slice(0, 24);
}

async function listBy(tid, pg) {
  if (tid === 'rank') {
    return items(await getJson(HOST + '/api/ranks/hot?page=' + pg));
  }
  if (KW[tid]) {
    return await collect(KW[tid], pg, true);
  }
  var sort = tid === 'new' ? 'new' : 'hot';
  return items(await getJson(HOST + '/api/videos?page=' + pg + '&page_size=24&sort=' + sort));
}

var rule = {
  类型: '影视',
  title: '黄果短剧',
  host: HOST,
  homeUrl: '/api/videos?page=1&page_size=24&sort=hot&x=hot',
  url: '/api/videos?page=fypage&page_size=24&sort=hot&x=fyclass',
  searchUrl: '/api/search?q=**&page=fypage',
  class_name: CATS.map(function (c) { return c[0]; }).join('&'),
  class_url: CATS.map(function (c) { return c[1]; }).join('&'),
  headers: HEADERS,
  timeout: 10000,
  play_parse: true,
  searchable: 1,
  quickSearch: 1,
  filterable: 0,
  limit: 24,

  推荐: async function () {
    return pack(await listBy('hot', 1));
  },

  一级: async function () {
    var q = query(absUrl(this.input));
    var tid = q.x || 'hot';
    var pg = parseInt(q.page || '1', 10) || 1;
    return pack(await listBy(tid, pg));
  },

  二级: async function () {
    var id = t(this.input);
    if (!id) return {};
    var d = await getJson(HOST + '/api/videos/' + encodeURIComponent(id));
    var data = (d && d.data) || {};
    var eps = Object.prototype.toString.call(data.episodes) === '[object Array]' ? data.episodes : [];
    var list = [];
    if (eps.length) {
      for (var i = 0; i < eps.length; i++) {
        var n = eps[i].ep_num != null ? eps[i].ep_num : (eps[i].episode != null ? eps[i].episode : i + 1);
        var name = t(eps[i].title) || ('第' + n + '集');
        list.push(name + '$' + id + '@' + n);
      }
    } else {
      list.push('第1集$' + id + '@1');
    }
    return {
      vod_id: id,
      vod_name: t(data.title) || id,
      vod_pic: cover(data.cover),
      vod_content: t(data.description),
      vod_remarks: eps.length ? ('全' + eps.length + '集') : '',
      vod_play_from: '黄果',
      vod_play_url: list.join('#')
    };
  },

  搜索: async function () {
    var q = query(absUrl(this.input));
    var kw = t(q.q);
    if (!kw) return [];
    var pg = parseInt(q.page || '1', 10) || 1;
    return pack(await collect(kw, pg, false));
  },

  lazy: async function () {
    var s = t(this.input);
    var parts = s.split('@');
    var id = t(parts[0]);
    var ep = t(parts[1]) || '1';
    var d = await getJson(HOST + '/api/videos/' + encodeURIComponent(id) + '/play?ep=' + encodeURIComponent(ep));
    var url = t((d && d.data && d.data.video_url) || (d && d.video_url) || '');
    if (!url) return { parse: 0, url: s, headers: HEADERS, header: HEADERS };
    return { parse: 0, jx: 0, url: url, headers: HEADERS, header: HEADERS };
  }
};
