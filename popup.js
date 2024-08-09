document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('snippetForm');
  const snippetList = document.getElementById('snippetList');
  const downloadButton = document.getElementById('downloadAll');
  let editingIndex = null;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const code = document.getElementById('code').value;

    if (editingIndex === null) {
      saveSnippet(title, code);
    } else {
      updateSnippet(editingIndex, title, code);
      editingIndex = null;
    }

    form.reset();
  });

  downloadButton.addEventListener('click', downloadAllSnippets);

  function saveSnippet(title, code) {
    chrome.storage.sync.get({ snippets: [] }, (data) => {
      const snippets = data.snippets;
      snippets.unshift({ title, code }); // Add new snippet at the beginning
      chrome.storage.sync.set({ snippets }, renderSnippets);
    });
  }

  function updateSnippet(index, title, code) {
    chrome.storage.sync.get({ snippets: [] }, (data) => {
      const snippets = data.snippets;
      snippets[index] = { title, code };
      chrome.storage.sync.set({ snippets }, renderSnippets);
    });
  }

  function renderSnippets() {
    chrome.storage.sync.get({ snippets: [] }, (data) => {
      snippetList.innerHTML = '';
      data.snippets.forEach((snippet, index) => {
        const snippetElement = document.createElement('div');
        snippetElement.classList.add('snippet');

        const titleElement = document.createElement('h2');
        titleElement.textContent = snippet.title;

        const codeElement = document.createElement('pre');
        codeElement.textContent = snippet.code;

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => {
          editSnippet(index, snippet.title, snippet.code);
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
          deleteSnippet(index);
        });

        const downloadButton = document.createElement('button');
        downloadButton.textContent = 'Download';
        downloadButton.addEventListener('click', () => {
          downloadSnippet(snippet.title, snippet.code);
        });

        snippetElement.appendChild(titleElement);
        snippetElement.appendChild(codeElement);
        snippetElement.appendChild(editButton);
        snippetElement.appendChild(deleteButton);
        snippetElement.appendChild(downloadButton);

        snippetList.appendChild(snippetElement);
      });
    });
  }

  function deleteSnippet(index) {
    chrome.storage.sync.get({ snippets: [] }, (data) => {
      const snippets = data.snippets;
      snippets.splice(index, 1);
      chrome.storage.sync.set({ snippets }, renderSnippets);
    });
  }

  function editSnippet(index, title, code) {
    document.getElementById('title').value = title;
    document.getElementById('code').value = code;
    editingIndex = index;
  }

  function downloadSnippet(title, code) {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadAllSnippets() {
    chrome.storage.sync.get({ snippets: [] }, (data) => {
      let allSnippets = '';
      data.snippets.forEach((snippet) => {
        allSnippets += `Title: ${snippet.title}\nCode:\n${snippet.code}\n\n`;
      });
      const blob = new Blob([allSnippets], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'all_snippets.txt';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  renderSnippets();
});
