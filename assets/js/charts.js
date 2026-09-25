/* Charts for the Soy Story pages. Data sources are linked under each chart on the page. */

(function () {
  if (typeof Chart === "undefined") return;

  Chart.defaults.font.family = '"Source Sans 3", "Segoe UI", system-ui, sans-serif';
  Chart.defaults.font.size = 13;
  Chart.defaults.color = "#4a463d";

  const GREEN = "#43702f";
  const GOLD = "#c9a227";
  const RUST = "#a4471b";
  const GREY = "#9fae94";
  const GRID = "#ece6d6";

  const YEARS = Array.from({ length: 31 }, (_, i) => 1992 + i); // 1992–2022
  const $ = (id) => document.getElementById(id);

  // Draws the value at the end of each bar (horizontal bar charts).
  const valueLabels = {
    id: "valueLabels",
    afterDatasetsDraw(chart, _args, opts) {
      const { ctx } = chart;
      ctx.save();
      ctx.font = "600 12px " + Chart.defaults.font.family;
      ctx.fillStyle = "#26241f";
      ctx.textBaseline = "middle";
      chart.getDatasetMeta(0).data.forEach((bar, i) => {
        const v = chart.data.datasets[0].data[i];
        ctx.fillText(v.toFixed(opts.decimals ?? 1), bar.x + 6, bar.y);
      });
      ctx.restore();
    },
  };

  function fillTable(id, rows) {
    const tbody = $(id);
    if (tbody) tbody.innerHTML = rows.map((r) => `<tr>${r.map((c, i) => `<td${i ? ' class="num"' : ""}>${c}</td>`).join("")}</tr>`).join("");
  }

  /* ================= DATA =================
     USDA-ERS Oil Crops Yearbook (Table 2, 3, 5, 37, 38). Years are marketing years
     (e.g. 1992 = 1992/93). Population: U.S. Census Bureau July 1 estimates. */

  // Table 2: U.S. soybean production, million bushels
  const production = [2190, 1870, 2515, 2174, 2380, 2689, 2741, 2654, 2758, 2891, 2756, 2454, 3124, 3068, 3197, 2677, 2967, 3361, 3331, 3097, 3042, 3357, 3928, 3927, 4296, 4412, 4428, 3551, 4216, 4464, 4270];

  // Table 5 ÷ population: soybean oil per person, pounds
  const oilFood = [50.7, 49.8, 49.1, 50.6, 53.0, 56.0, 56.8, 57.5, 57.7, 58.7, 59.0, 57.7, 58.0, 55.5, 53.0, 50.1, 46.8, 46.1, 44.6, 43.8, 44.9, 43.8, 43.7, 45.2, 42.3, 43.2, 43.5, 41.6, 43.4, 43.5, 42.3];
  const oilBiofuel = [0, 0, 0, 0, 0, 0, 0, 0, 0.2, 0.3, 0.4, 0.4, 1.5, 5.3, 9.3, 10.8, 6.6, 5.5, 8.8, 15.6, 14.9, 16.1, 15.8, 17.7, 19.2, 22.6, 26.5, 26.4, 26.9, 31.3, 37.5];

  // Table 3: U.S. soybean imports and exports, million bushels
  const imports = [2.1, 6.4, 5.5, 4.5, 8.9, 5.0, 3.5, 4.2, 3.6, 2.3, 4.7, 5.6, 5.6, 3.4, 9.0, 9.9, 13.3, 14.6, 14.4, 16.1, 40.5, 71.8, 33.2, 23.5, 22.3, 21.8, 14.1, 15.4, 19.8, 15.9, 24.5];
  const exports = [770.6, 588.1, 840.2, 849.1, 885.9, 874.3, 804.7, 975.0, 995.9, 1063.7, 1044.4, 886.6, 1097.2, 939.9, 1116.5, 1158.8, 1279.3, 1499.0, 1505.0, 1366.3, 1327.5, 1638.6, 1842.2, 1942.6, 2166.6, 2133.7, 1753.4, 1682.9, 2265.8, 2152.1, 1979.1];

  const lineOpts = (yTitle, extra = {}) => ({
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: { legend: { position: "top", align: "end", labels: { boxWidth: 14 } }, ...extra.plugins },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: yTitle }, grid: { color: GRID }, ...extra.y },
      x: { grid: { display: false }, ticks: { maxRotation: 45, autoSkip: true, maxTicksLimit: 16 } },
    },
  });

  /* ---------- Part A, Q1: per-person availability ---------- */
  if ($("chart-availability")) {
    new Chart($("chart-availability"), {
      type: "line",
      data: {
        labels: YEARS,
        datasets: [
          { label: "Soybean oil available for food and other uses", data: oilFood, borderColor: GREEN, backgroundColor: GREEN, borderWidth: 3, pointRadius: 2.5, tension: 0.15 },
          { label: "Soybean oil used for biofuel", data: oilBiofuel, borderColor: GOLD, backgroundColor: GOLD, borderWidth: 3, pointRadius: 2.5, borderDash: [6, 4], tension: 0.15 },
        ],
      },
      options: lineOpts("Pounds per person", {
        plugins: { tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}: ${c.parsed.y} lb` } } },
      }),
    });
    fillTable("availability-rows", YEARS.map((y, i) => [y, oilFood[i].toFixed(1), oilBiofuel[i].toFixed(1)]));
  }

  /* ---------- Part A, Q2: U.S. production ---------- */
  // Q2 uses 1994–2024 (assignment range). Table 2, million bushels.
  const PYEARS = Array.from({ length: 31 }, (_, i) => 1994 + i);
  const prod94 = production.slice(2).concat([4162, 4374]);
  if ($("chart-production")) {
    new Chart($("chart-production"), {
      type: "line",
      data: {
        labels: PYEARS,
        datasets: [{
          label: "U.S. soybean production", data: prod94.map((v) => v / 1000),
          borderColor: GREEN, backgroundColor: "rgba(67, 112, 47, 0.12)", fill: true, borderWidth: 3, pointRadius: 3, pointHoverRadius: 6, tension: 0.15,
        }],
      },
      options: lineOpts("Billion bushels", {
        y: { max: 5 },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => ` ${c.parsed.y.toFixed(2)} billion bushels (≈ ${(prod94[c.dataIndex] * 27.2155 / 1000).toFixed(1)} million metric tons)` } },
        },
      }),
    });
    fillTable("production-rows", PYEARS.map((y, i) => [y, prod94[i].toLocaleString(), (prod94[i] * 27.2155 / 1000).toFixed(1)]));
  }

  /* ---------- Part A, Q6: carbon footprint comparison ----------
     kg CO2e per kg (= lb per lb). Poore & Nemecek (2018) via Our World in Data;
     raw soybeans from CarbonCloud (Americas, farm gate). */
  const carbon = [
    ["Beef (beef herd)", 99.5, false], ["Lamb & mutton", 39.7, false], ["Cheese", 23.9, false],
    ["Pork", 12.3, false], ["Chicken", 9.9, false], ["Soybean oil", 6.3, true], ["Eggs", 4.7, false],
    ["Rice", 4.5, false], ["Tofu", 3.2, true], ["Wheat & rye", 1.6, false], ["Soy milk", 1.0, true],
    ["Soybeans (raw, at the farm)", 0.8, true],
  ];
  if ($("chart-carbon")) {
    new Chart($("chart-carbon"), {
      type: "bar",
      data: {
        labels: carbon.map((d) => d[0]),
        datasets: [{ data: carbon.map((d) => d[1]), backgroundColor: carbon.map((d) => (d[2] ? GOLD : GREY)), borderRadius: 4, barPercentage: 0.8 }],
      },
      options: {
        indexAxis: "y", maintainAspectRatio: false, layout: { padding: { right: 36 } },
        plugins: { legend: { display: false }, valueLabels: { decimals: 1 }, tooltip: { callbacks: { label: (c) => ` ${c.parsed.x} lb CO₂e per lb of food` } } },
        scales: { x: { beginAtZero: true, title: { display: true, text: "Pounds of CO₂-equivalent per pound of food" }, grid: { color: GRID } }, y: { grid: { display: false } } },
      },
      plugins: [valueLabels],
    });
  }

  /* ---------- Part B, Q1: world production by region (Tables 37 & 45) ----------
     Million metric tons. Major exporters = Brazil, Argentina, Paraguay, Uruguay.
     Major importers = EU, China, Japan, Mexico, Southeast Asia. */
  const world = {
    "2010/11": { us: 90.6, sa: 132.9, imp: 17.4, total: 264.3 },
    "2024/25": { us: 119.0, sa: 237.0, imp: 24.7, total: 427.2 },
  };
  if ($("chart-world")) {
    const seasons = Object.keys(world);
    const part = (k) => seasons.map((s) => world[s][k]);
    const rest = seasons.map((s) => +(world[s].total - world[s].us - world[s].sa - world[s].imp).toFixed(1));
    new Chart($("chart-world"), {
      type: "bar",
      data: {
        labels: seasons,
        datasets: [
          { label: "Brazil, Argentina, Paraguay & Uruguay", data: part("sa"), backgroundColor: GOLD },
          { label: "United States", data: part("us"), backgroundColor: GREEN },
          { label: "China, EU, Japan, Mexico & SE Asia", data: part("imp"), backgroundColor: RUST },
          { label: "Rest of world (India, Canada, Russia, etc.)", data: rest, backgroundColor: GREY },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { boxWidth: 14 } },
          tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}: ${c.parsed.y} MMT (${(100 * c.parsed.y / world[c.label].total).toFixed(0)}%)` } },
        },
        scales: {
          x: { stacked: true, grid: { display: false } },
          y: { stacked: true, title: { display: true, text: "Million metric tons" }, grid: { color: GRID } },
        },
      },
    });
  }


  /* ---------- Part B: top-10 bar charts ----------
     Countries: FAOSTAT (QCL, soya beans, production), million metric tons.
     States: USDA-NASS Quick Stats, million acres (2010 planted, 2025 harvested). */
  const top10 = {
    "chart-countries-2024": { unit: "million metric tons", decimals: 1, color: GOLD, highlight: "United States", rows: [["Brazil", 144.47], ["United States", 118.84], ["Argentina", 48.21], ["China", 20.66], ["India", 15.13], ["Paraguay", 11.1], ["Canada", 7.57], ["Russia", 7.0], ["Ukraine", 6.64], ["Bolivia", 3.22]] },
    "chart-countries-2010": { unit: "million metric tons", decimals: 1, color: GOLD, highlight: "United States", rows: [["United States", 90.66], ["Brazil", 68.76], ["Argentina", 52.68], ["China", 15.08], ["India", 12.73], ["Paraguay", 7.46], ["Canada", 4.44], ["Uruguay", 1.79], ["Bolivia", 1.69], ["Ukraine", 1.68]] },
    "chart-states-2025": { unit: "million acres harvested", decimals: 2, color: GREEN, highlight: "Pennsylvania", rows: [["Illinois", 10.23], ["Iowa", 9.38], ["Minnesota", 7.07], ["North Dakota", 6.49], ["Missouri", 5.53], ["Indiana", 5.43], ["South Dakota", 5.06], ["Ohio", 4.88], ["Nebraska", 4.79], ["Kansas", 4.05], ["Pennsylvania", 0.57]] },
    "chart-states-2010": { unit: "million acres planted", decimals: 2, color: GREEN, highlight: "Pennsylvania", rows: [["Iowa", 9.8], ["Illinois", 9.1], ["Minnesota", 7.4], ["Indiana", 5.35], ["Missouri", 5.15], ["Nebraska", 5.15], ["Ohio", 4.6], ["Kansas", 4.3], ["South Dakota", 4.2], ["North Dakota", 4.1], ["Pennsylvania", 0.5]] },
  };
  Object.entries(top10).forEach(([id, cfg]) => {
    if (!$(id)) return;
    new Chart($(id), {
      type: "bar",
      data: {
        labels: cfg.rows.map((r) => r[0]),
        datasets: [{ data: cfg.rows.map((r) => r[1]), backgroundColor: cfg.rows.map((r) => (r[0] === cfg.highlight ? RUST : cfg.color)), borderRadius: 4, barPercentage: 0.8 }],
      },
      options: {
        indexAxis: "y", maintainAspectRatio: false, layout: { padding: { right: 40 } },
        plugins: { legend: { display: false }, valueLabels: { decimals: cfg.decimals }, tooltip: { callbacks: { label: (c) => ` ${c.parsed.x} ${cfg.unit}` } } },
        scales: { x: { beginAtZero: true, title: { display: true, text: cfg.unit[0].toUpperCase() + cfg.unit.slice(1) }, grid: { color: GRID } }, y: { grid: { display: false } } },
      },
      plugins: [valueLabels],
    });
  });

  /* ---------- Part B, Q3: U.S. imports and exports ---------- */
  if ($("chart-trade")) {
    new Chart($("chart-trade"), {
      type: "line",
      data: {
        labels: YEARS,
        datasets: [
          { label: "Exports", data: exports.map((v) => v / 1000), borderColor: GREEN, backgroundColor: GREEN, borderWidth: 3, pointRadius: 2.5, tension: 0.15 },
          { label: "Imports", data: imports.map((v) => v / 1000), borderColor: RUST, backgroundColor: RUST, borderWidth: 3, pointRadius: 2.5, tension: 0.15 },
        ],
      },
      options: lineOpts("Billion bushels", {
        plugins: { tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}: ${(c.parsed.y * 1000).toFixed(1)} million bushels` } } },
      }),
    });
    fillTable("trade-rows", YEARS.map((y, i) => [y, exports[i].toFixed(1), imports[i].toFixed(1)]));
  }

  /* ---------- Part B, Q5: export destinations (Table 38), thousand metric tons ---------- */
  const destColors = { China: RUST, Mexico: GOLD, Egypt: "#6f9a4a", Germany: "#3b6e8f", Japan: "#8c6bb1", Indonesia: "#c77c3a", Netherlands: "#5c8a8a", "All others": "#c9c2b0" };
  const destinations = {
    "2015/16": { China: 30562, Mexico: 3577, Germany: 2332, Indonesia: 2286, Japan: 2282, Netherlands: 1412, total: 52869 },
    "2024/25": { China: 22649, Mexico: 5208, Egypt: 3339, Germany: 2464, Japan: 2172, Indonesia: 2159, total: 51227 },
  };
  Object.entries({ "chart-dest-2015": "2015/16", "chart-dest-2024": "2024/25" }).forEach(([id, season]) => {
    if (!$(id)) return;
    const d = destinations[season];
    const names = Object.keys(d).filter((k) => k !== "total");
    const vals = names.map((n) => d[n]);
    names.push("All others");
    vals.push(d.total - vals.reduce((a, b) => a + b, 0));
    new Chart($(id), {
      type: "doughnut",
      data: { labels: names, datasets: [{ data: vals, backgroundColor: names.map((n) => destColors[n]), borderColor: "#fff", borderWidth: 2 }] },
      options: {
        maintainAspectRatio: false, cutout: "52%",
        plugins: {
          legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 12 } } },
          tooltip: { callbacks: { label: (c) => ` ${c.label}: ${(c.parsed / 1000).toFixed(1)} MMT (${(100 * c.parsed / d.total).toFixed(0)}%)` } },
        },
      },
    });
  });

  /* ---------- Part D, Q3: U.S. soybean exports to China (Table 38) ---------- */
  if ($("chart-china")) {
    const seasons = ["2015/16", "2016/17", "2017/18", "2018/19", "2019/20", "2020/21", "2021/22", "2022/23", "2023/24", "2024/25"];
    const china = [30562, 36119, 28194, 13407, 16138, 35523, 29927, 31248, 24959, 22649];
    const worldTotal = [52869, 58964, 58071, 47721, 45800, 61664, 58570, 53864, 46266, 51227];
    new Chart($("chart-china"), {
      type: "bar",
      data: {
        labels: seasons,
        datasets: [
          { label: "Exports to China", data: china.map((v) => v / 1000), backgroundColor: seasons.map((s) => (s === "2018/19" ? RUST : GOLD)), borderRadius: 3 },
          { label: "Exports to all other countries", data: china.map((v, i) => (worldTotal[i] - v) / 1000), backgroundColor: GREY, borderRadius: 3 },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top", align: "end", labels: { boxWidth: 14 } },
          tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}: ${c.parsed.y.toFixed(1)} MMT` } },
        },
        scales: {
          x: { stacked: true, grid: { display: false } },
          y: { stacked: true, title: { display: true, text: "Million metric tons" }, grid: { color: GRID } },
        },
      },
    });
  }
})();
