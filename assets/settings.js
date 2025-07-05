//console.log("✅ Attempts-viewer-js chargé (début)");

// Injecter styles globaux pour les icônes copy (toujours présents)
const style = document.createElement('style');
style.innerHTML = `
  .copy-icon {
    cursor: pointer;
    margin-right: 5px;
    color: #0d6efd;
  }
  .copy-icon:hover {
    color: #0a58ca;
  }
`;
document.head.appendChild(style);

fetch('/plugins/ctfd-attempts-viewer/api/settings')
  .then(res => res.json())
  .then(configs => {
    const showMainButton = configs.show_main_button;

    // Partie bouton principal "Historique général"
    if (showMainButton && window.location.pathname === "/challenges") {
      const container = document.querySelector('.row > .col-md-12');
      if (container && !document.querySelector('#btn-attempts-page')) {
        const wrapper = document.createElement('div');
        wrapper.className = "d-flex justify-content-center mb-4";
        wrapper.id = "btn-attempts-wrapper";

        const button = document.createElement('a');
        button.href = "/plugins/ctfd-attempts-viewer/attempts";
        button.className = "btn btn-info text-white shadow rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 transition";
        button.id = "btn-attempts-page";

        const icon = document.createElement('i');
        icon.className = "fa fa-folder pr-1";

        const span = document.createElement('span');
        span.innerText = "Historique de vos tentatives";

        button.appendChild(icon);
        button.appendChild(span);
        wrapper.appendChild(button);
        container.prepend(wrapper);

        const styleButton = document.createElement('style');
        styleButton.innerHTML = `
          #btn-attempts-page:hover {
            background-color: #212529;
          }
          .transition {
            transition: all 0.2s ease-in-out;
          }
        `;
        document.head.appendChild(styleButton);
      }
    }
  })
  .catch(err => {
    //console.error("❌ Erreur lors de la récupération de la config :", err);
  });

document.addEventListener("DOMContentLoaded", function () {
  if (!document.getElementById("attemptsModal")) {
    const modalHTML = `
      <div class="modal fade" id="attemptsModal" tabindex="-1" aria-labelledby="attemptsModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl">
          <div class="modal-content">
            <div class="modal-header d-flex justify-content-between align-items-center">
              <h5 class="modal-title m-0" id="attemptsModalLabel">Mes tentatives</h5>
              <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">
                Quitter
              </button>
            </div>
            <div class="modal-body" id="attemptsContent">
              <p>Chargement...</p>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  const challengeModal = document.getElementById("challenge-window");
  if (challengeModal) {
    const observer = new MutationObserver(() => {
      const navTabs = challengeModal.querySelector('.nav.nav-tabs');
      if (navTabs && !navTabs.querySelector('.nav-item-tentatives')) {
        let li = document.createElement("li");
        li.className = "nav-item nav-item-tentatives";
        li.innerHTML = `
          <button class="nav-link" id="tentatives-btn" type="button" data-bs-toggle="modal" data-bs-target="#attemptsModal">
            Tentatives
          </button>
        `;
        navTabs.appendChild(li);

        document.getElementById("tentatives-btn").addEventListener("click", showAttempts);
      }
    });

    observer.observe(challengeModal, { childList: true, subtree: true });
  }
});

// --- Fonction showAttempts() ---
function showAttempts() {
  const modalBody = document.getElementById("attemptsContent");
  modalBody.innerHTML = "<p>Chargement...</p>";

  let challengeId = null;

  if (window.location.hash) {
    const parts = window.location.hash.split("-");
    const lastPart = parts[parts.length - 1];
    if (!isNaN(parseInt(lastPart))) {
      challengeId = parseInt(lastPart);
      // console.log("✅ ID trouvé dans l'URL (hash):", challengeId);
    }
  }

  if (!challengeId) {
    modalBody.innerHTML = "<p>Impossible de trouver l'ID du challenge courant.</p>";
    return;
  }

  fetch('/plugins/ctfd-attempts-viewer/api/my-team-submissions')
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        let attempts = data.data.filter(sub => String(sub.challenge_id) === String(challengeId));

        // Trier du plus récent au plus vieux
        attempts.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (attempts.length === 0) {
          modalBody.innerHTML = '<p class="text-center my-3">Aucune tentative pour ce challenge.</p>';
          return;
        }

        const users = Array.from(new Set(attempts.map(sub => sub.user_name)));

        let html = `
          <div class="mb-3">
            <label for="userFilter" class="form-label">Filtrer par joueur :</label>
            <select id="userFilter" class="form-select">
              <option value="">Tous</option>
              ${users.map(u => `<option value="${u}">${u}</option>`).join("")}
            </select>
          </div>
          <div id="attemptsTableWrapper"></div>
        `;

        modalBody.innerHTML = html;

        const tableWrapper = document.getElementById("attemptsTableWrapper");

        function renderTable(data, page = 1, perPage = 5) {
          const totalPages = Math.ceil(data.length / perPage);
          const start = (page - 1) * perPage;
          const pagedData = data.slice(start, start + perPage);

          let tableHtml = `
            <table class="table table-bordered">
              <thead>
                <tr>
                  <th>Joueur</th>
                  <th>Réponse tentée</th>
                  <th>Type</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
          `;

          pagedData.forEach(sub => {
            const isGeo = sub.submission.includes("lat:");
            tableHtml += `
              <tr>
                <td>${sub.user_name}</td>
                <td>
                  ${isGeo ? `<span>${sub.submission}</span>` : `
                    <i class="fa fa-copy copy-icon" title="Copier" data-submission="${encodeURIComponent(sub.submission)}"></i>
                    ${sub.submission}
                  `}
                </td>
                <td>${sub.type}</td>
                <td>${sub.date}</td>
              </tr>
            `;
          });

          tableHtml += `</tbody></table>`;

          let paginationHtml = `<nav><ul class="pagination">`;
          for (let i = 1; i <= totalPages; i++) {
            paginationHtml += `
              <li class="page-item ${i === page ? 'active' : ''}">
                <a class="page-link" href="#" onclick="renderAttemptsPage(event, ${i})">${i}</a>
              </li>
            `;
          }
          paginationHtml += `</ul></nav>`;

          tableWrapper.innerHTML = tableHtml + paginationHtml;

          // Attacher listeners copie
          const copyIcons = tableWrapper.querySelectorAll(".copy-icon");
          copyIcons.forEach(icon => {
            icon.addEventListener("click", () => {
              const text = decodeURIComponent(icon.getAttribute("data-submission"));
              navigator.clipboard.writeText(text).then(() => {
                icon.style.color = "#28a745";
                setTimeout(() => {
                  icon.style.color = "";
                }, 1000);
              });
            });
          });
        }

        window.renderAttemptsPage = (e, page) => {
          e.preventDefault();
          const selectedUser = document.getElementById("userFilter").value;
          let filtered = attempts;
          if (selectedUser) {
            filtered = attempts.filter(sub => sub.user_name === selectedUser);
          }
          renderTable(filtered, page);
        };

        document.getElementById("userFilter").addEventListener("change", function () {
          const selectedUser = this.value;
          let filtered = attempts;
          if (selectedUser) {
            filtered = attempts.filter(sub => sub.user_name === selectedUser);
          }
          renderTable(filtered, 1);
        });

        renderTable(attempts, 1);
      } else {
        modalBody.innerHTML = "<p>Erreur lors de la récupération des tentatives.</p>";
      }
    })
    .catch(() => {
      modalBody.innerHTML = "<p>Erreur réseau ou serveur.</p>";
    });
}
