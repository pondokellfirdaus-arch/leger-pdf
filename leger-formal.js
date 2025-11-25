// Script untuk navigasi responsif
document.getElementById('hamburger').addEventListener('click', function () {
  const navMenu = document.getElementById('nav-menu');
  navMenu.classList.toggle('show');
});

// API URL
const API = "https://script.google.com/macros/s/AKfycbzO6acgLhtg7KXC82ZWeFQDTyEGeHQf1Vqz4Eg28eiwcmu4V3ut0ykhKQ_Wm8yatTNQ-g/exec";

const kelasSelect = document.getElementById("kelasSelect");
const mapelSelect = document.getElementById("mapelSelect");
const tableContainer = document.getElementById("tableContainer");
const saveBtn = document.getElementById("saveBtn");

let currentData = [];

// Load metadata kelas & mapel
async function loadMeta() {
  try {
    const res = await fetch(API + "?action=getMetaData");
    const data = await res.json();

    data.kelas.forEach(k => {
      let opt = document.createElement("option");
      opt.value = k;
      opt.textContent = k;
      kelasSelect.appendChild(opt);
    });

    sessionStorage.setItem("mapelList", JSON.stringify(data.mapel));
  } catch (error) {
    console.error("Error loading metadata:", error);
    showPopup("Gagal memuat data kelas dan mapel", "#f44336");
  }
}

loadMeta();

// Saat memilih kelas
kelasSelect.addEventListener("change", () => {
  mapelSelect.innerHTML = `<option value="">Pilih mapel</option>`;

  if (!kelasSelect.value) {
    mapelSelect.disabled = true;
    saveBtn.disabled = true;
    tableContainer.innerHTML = "";
    return;
  }

  let mapel = JSON.parse(sessionStorage.getItem("mapelList"));
  mapel.forEach(m => {
    let opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    mapelSelect.appendChild(opt);
  });

  mapelSelect.disabled = false;
});

// Memuat nilai saat mapel dipilih
mapelSelect.addEventListener("change", async () => {
  if (!mapelSelect.value) {
    tableContainer.innerHTML = "";
    saveBtn.disabled = true;
    return;
  }

  try {
    const res = await fetch(API + `?action=getNilai&kelas=${kelasSelect.value}&mapel=${mapelSelect.value}`);
    currentData = await res.json();

    buildTable(currentData);
    saveBtn.disabled = false;
  } catch (error) {
    console.error("Error loading nilai:", error);
    showPopup("Gagal memuat data nilai", "#f44336");
  }
});

// Bangun tabel nilai
function buildTable(arr) {
  let html = `<table>
    <thead>
      <tr>
        <th>Nama</th>
        <th>Nilai</th>
      </tr>
    </thead>
    <tbody>
  `;

  arr.forEach((x, i) => {
    html += `
      <tr>
        <td>${x.nama}</td>
        <td><input type="number" value="${x.nilai}" data-index="${i}" min="0" max="100" /></td>
      </tr>
    `;
  });

  html += "</tbody></table>";
  tableContainer.innerHTML = html;

  document.querySelectorAll("input").forEach(inp => {
    inp.oninput = () => {
      let i = inp.dataset.index;
      currentData[i].nilai = inp.value;
    };
  });
}

function showPopup(message, color = "#4caf50") {
  const popup = document.getElementById("popup");
  popup.textContent = message;
  popup.style.background = color;
  popup.style.display = "block";

  setTimeout(() => {
    popup.style.display = "none";
  }, 2000);
}

// Simpan nilai
saveBtn.addEventListener("click", async () => {
  const body = {
    action: "saveNilai",
    kelas: kelasSelect.value,
    mapel: mapelSelect.value,
    nilai: currentData.map(x => x.nilai)
  };

  try {
    const res = await fetch(API, {
      method: "POST",
      body: JSON.stringify(body)
    });

    const result = await res.json();
    showPopup(result.message || "Nilai berhasil disimpan!");
  } catch (error) {
    console.error("Error saving nilai:", error);
    showPopup("Gagal menyimpan nilai", "#f44336");
  }
});
