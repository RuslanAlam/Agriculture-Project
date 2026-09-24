/* Charts for the Assignment A page. Data sources are linked under each chart on the page. */

(function () {
  if (typeof Chart === "undefined") return;

  Chart.defaults.font.family = '"Source Sans 3", "Segoe UI", system-ui, sans-serif';
  Chart.defaults.font.size = 13;
  Chart.defaults.color = "#4a463d";

  const GREEN = "#43702f";
  const GOLD = "#c9a227";
  const GREY = "#9fae94";

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

  /* ---------- Q2: U.S. soybean production, 1992–2022 ----------
     USDA NASS annual U.S. soybean production, million bushels.
     1 bushel of soybeans = 60 lb = 27.2155 kg. */
  const production = {
    1992: 2190, 1993: 1870, 1994: 2515, 1995: 2177, 1996: 2380, 1997: 2689,
    1998: 2741, 1999: 2654, 2000: 2758, 2001: 2891, 2002: 2756, 2003: 2454,
    2004: 3124, 2005: 3068, 2006: 3197, 2007: 2677, 2008: 2967, 2009: 3359,
    2010: 3329, 2011: 3097, 2012: 3042, 2013: 3357, 2014: 3927, 2015: 3926,
    2016: 4296, 2017: 4412, 2018: 4428, 2019: 3552, 2020: 4216, 2021: 4465,
    2022: 4270,
  };

  const prodEl = document.getElementById("chart-production");
  if (prodEl) {
    const years = Object.keys(production);
    const bushels = years.map((y) => production[y] / 1000); // billion bushels
    new Chart(prodEl, {
      type: "line",
      data: {
        labels: years,
        datasets: [{
          label: "U.S. soybean production (billion bushels)",
          data: bushels,
          borderColor: GREEN,
          backgroundColor: "rgba(67, 112, 47, 0.12)",
          fill: true,
          borderWidth: 3,
          pointRadius: 3,
          pointHoverRadius: 6,
          tension: 0.15,
        }],
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (c) => {
                const bu = production[c.label];
                const mmt = (bu * 27.2155 / 1000).toFixed(1);
                return ` ${(bu / 1000).toFixed(2)} billion bushels (≈ ${mmt} million metric tons)`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 5,
            title: { display: true, text: "Billion bushels" },
            grid: { color: "#ece6d6" },
          },
          x: { grid: { display: false }, ticks: { maxRotation: 45, autoSkip: true, maxTicksLimit: 16 } },
        },
      },
    });

    // Fill the data table under the chart.
    const tbody = document.getElementById("production-rows");
    if (tbody) {
      tbody.innerHTML = years.map((y) => {
        const bu = production[y];
        return `<tr><td>${y}</td><td class="num">${bu.toLocaleString()}</td><td class="num">${(bu * 27.2155 / 1000).toFixed(1)}</td></tr>`;
      }).join("");
    }
  }

  /* ---------- Q6: carbon footprint comparison ----------
     kg CO2-equivalent per kg of food (same as lb per lb).
     Soy foods and other foods: Poore & Nemecek (2018), via Our World in Data.
     Raw soybeans: CarbonCloud benchmark for soybeans grown in the Americas (at the farm). */
  const carbon = [
    ["Beef (beef herd)", 99.5, false],
    ["Lamb & mutton", 39.7, false],
    ["Cheese", 23.9, false],
    ["Pork", 12.3, false],
    ["Chicken", 9.9, false],
    ["Soybean oil", 6.3, true],
    ["Eggs", 4.7, false],
    ["Rice", 4.5, false],
    ["Tofu", 3.2, true],
    ["Wheat & rye", 1.6, false],
    ["Soy milk", 1.0, true],
    ["Soybeans (raw, at the farm)", 0.8, true],
  ];

  const carbonEl = document.getElementById("chart-carbon");
  if (carbonEl) {
    new Chart(carbonEl, {
      type: "bar",
      data: {
        labels: carbon.map((d) => d[0]),
        datasets: [{
          data: carbon.map((d) => d[1]),
          backgroundColor: carbon.map((d) => (d[2] ? GOLD : GREY)),
          borderRadius: 4,
          barPercentage: 0.8,
        }],
      },
      options: {
        indexAxis: "y",
        maintainAspectRatio: false,
        layout: { padding: { right: 36 } },
        plugins: {
          legend: { display: false },
          valueLabels: { decimals: 1 },
          tooltip: {
            callbacks: { label: (c) => ` ${c.parsed.x} lb CO₂e per lb of food` },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            title: { display: true, text: "Pounds of CO₂-equivalent per pound of food" },
            grid: { color: "#ece6d6" },
          },
          y: { grid: { display: false } },
        },
      },
      plugins: [valueLabels],
    });
  }
})();
