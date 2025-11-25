// Navigasi responsif
document.getElementById('hamburger').addEventListener('click', function () {
  const navMenu = document.getElementById('nav-menu');
  navMenu.classList.toggle('show');
});

// URL APP SCRIPT
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw8ydCYVPf66qMnD5U8BPcdQCW5Hrm5cD0IAvitTdXmwBi_gihAxEeXM51vMmreiGw/exec";

// Load daftar kelas dari Sheet
async function loadKelas() {
  const res = await fetch(SCRIPT_URL + "?action=getSheets");
  const sheets = await res.json();
  const dropdown = document.getElementById("kelasDropdown");

  dropdown.innerHTML = "";

  sheets.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    dropdown.appendChild(opt);
  });

  dropdown.addEventListener("change", loadData);
  loadData();
}

// Load data siswa berdasarkan kelas
async function loadData() {
  const kelas = document.getElementById("kelasDropdown").value;
  const res = await fetch(SCRIPT_URL + `?action=getData&sheet=${kelas}`);
  const data = await res.json();
  const tbody = document.getElementById("dataBody");
  tbody.innerHTML = "";

  const formalList = [
    "Salaf", "Wustha 1A", "Wustha 1B", "Wustha 1C", "Wustha 1D", "Wustha 2",
    "Ulya 1A", "Ulya 1B", "Ulya 2A", "Ulya 2B", "Ulya 2C"
  ];

  data.forEach(row => {
    const tr = document.createElement("tr");

    // Nama
    const tdNama = document.createElement("td");
    tdNama.textContent = row[0] || "";
    tr.appendChild(tdNama);

    // Dropdown kelas formal
    const tdFormal = document.createElement("td");
    const select = document.createElement("select");

    formalList.forEach(f => {
      const opt = document.createElement("option");
      opt.value = f;
      opt.textContent = f;
      if (row[1] === f) opt.selected = true;
      select.appendChild(opt);
    });

    // AUTO-SAVE saat dropdown berubah
    select.addEventListener("change", async () => {
      const nama = tdNama.textContent;
      const kelasFormal = select.value;

      await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          action: "updateData",
          sheet: kelas,
          name: nama,
          kelasFormal: kelasFormal
        })
      });

      showPopup("Perubahan disimpan otomatis!");
    });

    tdFormal.appendChild(select);
    tr.appendChild(tdFormal);
    tbody.appendChild(tr);
  });
}

// Tombol simpan manual
document.getElementById("saveBtn").addEventListener("click", saveData);

async function saveData() {
  const kelas = document.getElementById("kelasDropdown").value;
  const rows = document.querySelectorAll("#dataBody tr");

  for (const tr of rows) {
    const nama = tr.children[0].textContent;
    const kelasFormal = tr.children[1].querySelector("select").value;

    await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        action: "updateData",
        sheet: kelas,
        name: nama,
        kelasFormal: kelasFormal
      })
    });
  }

  showPopup("Semua perubahan berhasil disimpan!");
}

// Popup notifikasi
function showPopup(msg, color = "#4caf50") {
  const popup = document.getElementById("popup");
  popup.textContent = msg;
  popup.style.background = color;
  popup.style.display = "block";

  setTimeout(() => {
    popup.style.display = "none";
  }, 2000);
}

// Load awal
loadKelas();
