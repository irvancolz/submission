const finishedBookContainer = document.querySelector('#finished-read .book-container');
const unFinishedBookContainer = document.querySelector('#unfinished-read .book-container');
const addBookForm = document.querySelector('#add-book-form');
const editBookForm = document.querySelector('#edit-book-form');
const alertContainer = document.querySelector('#alert-container');
const cancelEditBtn = editBookForm.querySelector('.cancel-btn');
const searchBookForm = document.querySelector('#search-book');
const searchResultContainer = document.querySelector('#search-result-container');
const header = document.querySelector('header').offsetHeight;

let bookList = [];
let finishedBookList=[]; 
let unFinishedBookList=[]; 
let globalBookId;

window.addEventListener('load', ()=>{
    newBookList = getFromLocalStorage();
    bookList= JSON.parse(newBookList)
    spliceShelf(bookList);
})

// event binding untuk elemen buku
document.addEventListener('click', e =>{
   if(e.target.classList.contains('delete-book-btn')){
    const bookId = event.target.dataset.id;
    deleteBookFromShelf(bookId);
   }
})

document.addEventListener('click', e =>{
   if(e.target.classList.contains('undo-read-btn')){
    const bookId = event.target.dataset.id;
    editBookReadStatus(bookId);
   }
})
document.addEventListener('click', e =>{
   if(e.target.classList.contains('edit-book-btn')){
    const bookId = event.target.dataset.id;
    openEditForm(bookId);
   }
})

document.addEventListener('click', e =>{
    const editFormWrapper = document.querySelector('.edit-form-wrapper');
    if(e.target === editFormWrapper){
       editFormWrapper.classList.add('hide');
   }
})

document.addEventListener('click', e =>{
    if(e.target === searchResultContainer){
       searchResultContainer.classList.add('hide');
   }
})

// buat objek buku baru
addBookForm.addEventListener('submit', e =>{
    e.preventDefault();
    const bookId = Date.now()
    const bookName = addBookForm.querySelector('#input-name').value;
    const bookAuthor = addBookForm.querySelector('#input-author').value;
    const bookYear = addBookForm.querySelector('#input-year').value;
    const isFinished = addBookForm.querySelector('#is-finish').checked;
    
    createBook(bookId, bookName, bookAuthor, bookYear, isFinished);
    resetAddBookForm();
});

// melakukan reset value pada form yang digunakan;
function resetAddBookForm(){
    addBookForm.querySelector('#input-name').value = '';
    addBookForm.querySelector('#input-author').value = '';
    addBookForm.querySelector('#input-year').value = '';
    addBookForm.querySelector('#is-finish').checked = false;
}

// mencari buku 
searchBookForm.addEventListener('submit', (e) =>{
    e.preventDefault();
    let searchValue = searchBookForm.querySelector('#search-input').value;
    searchBook(searchValue);
    searchValue = '';
})

// edit objek buku
editBookForm.addEventListener('submit', e =>{
    e.preventDefault();
    const bookId = Date.now()
    const bookName = editBookForm.querySelector('#edit-name').value;
    const bookAuthor = editBookForm.querySelector('#edit-author').value;
    const bookYear = editBookForm.querySelector('#edit-year').value;
    const isFinished = editBookForm.querySelector('#edit-is-finish').checked;
    
    editBook(bookId, bookName, bookAuthor, bookYear, isFinished);
    resetEditBookForm();

    
});

// melakukan reset pada form edit
function resetEditBookForm(){
    editBookForm.querySelector('#edit-name').value = '';
    editBookForm.querySelector('#edit-author').value = '';
    editBookForm.querySelector('#edit-year').value = '';
    editBookForm.querySelector('#edit-is-finish').checked = false;

    const editFormWrapper = document.querySelector('.edit-form-wrapper');
    editFormWrapper.classList.add('hide');
}

function createBook(id, name, author, year, finish){
    const book = {
        id : id,
        title: name,
        year: year,
        author: author,
        isComplete: finish,
    }
    const isBookHaveDuplicate = filterBook(book);
   if(isBookHaveDuplicate){
    //    tambahkan kode saat ada buku yang sama
    showAlert("Buku sudah ada");
   }else{
       bookList.push(book);
    //    kelompokkan buku
    spliceShelf(bookList);
    saveToLocalStorage(bookList);
    showAlert("Buku baru ditambahkan");
   }
};


// menerapkan nilai pada objek yang di edit
function editBook(id,title, author, year, isComplete){
    const newBook = {
        id,
        title,
        author,
        year,
        isComplete,
    }
    const duplicateBooks = filterBook(newBook);
    if(duplicateBooks){
        // tambah kan kode disini
        showAlert("Buku sudah ada")
    }else{
        const bookTarget = bookList.find(item =>{
            return parseInt(globalBookId) === item.id;
        });
        const targetedIndex = bookList.indexOf(bookTarget);
        bookList.splice(targetedIndex,1,newBook);
        spliceShelf(bookList);
        saveToLocalStorage(bookList);
        showAlert("perubahan berhasil disimpan");
    }
}
//membatalkan edit 
cancelEditBtn.addEventListener('click', ()=>{
    const editFormWrapper = document.querySelector('.edit-form-wrapper');
    editFormWrapper.classList.add('hide');
}) 

// memastikan tidak ada buku yang serupa
function filterBook(book){
let results;
  if(bookList.length > 0 ){
      const duplicateBooks = bookList.filter(item =>{
          return book.title.toLowerCase() === item.title.toLowerCase();
      });
      duplicateBooks.forEach(item =>{
          if(item.author.toLowerCase() === book.author.toLowerCase()){
              return results = true;
          }else{
              return results = false;
          }
      })
  }else{
      return false
  }
  return results
}

// membagi bookList menjadi 2 list berbeda
function spliceShelf(list){
    let newList = [...list]
       const finishedBooks = newList.filter(book =>{
           return book.isComplete === true;
       });
       const unFinishedBooks = newList.filter( book =>{
           return book.isComplete === false;
       })
    //    menugaskan hasil pada list yang aka ditampilkan
       finishedBookList = [...finishedBooks];
       unFinishedBookList = [...unFinishedBooks];
        makeBookShelf(finishedBookList, finishedBookContainer);
        makeBookShelf(unFinishedBookList, unFinishedBookContainer);
}

// membuat function yang mengatur buku;
// menghapus buku
function deleteBookFromShelf(id){
    const newList = bookList.filter(item =>{
        return parseInt(id) !== item.id;
    });
    bookList = newList;
    saveToLocalStorage(bookList);
    spliceShelf(bookList);
    showAlert("Buku berhasil dihapus");
}
// mengedit status baca  buku
function editBookReadStatus(id){
    const bookTarget = bookList.find(item =>{
        return parseInt(id) === item.id;
    });
    bookTarget.isComplete = !bookTarget.isComplete;    
    spliceShelf(bookList);
    saveToLocalStorage(bookList);
    showAlert("Buku berhasil dipindah");
}
// mengedit informasi pada buku
function openEditForm(id){
    const editFormWrapper = document.querySelector('.edit-form-wrapper');
    globalBookId = id;
    editFormWrapper.classList.remove('hide');
}

// menampilkan buku di rak 
function makeBookShelf(list, mainContainer){
    mainContainer.innerHTML = null;
    list.forEach(book =>{
        const container = document.createElement('div');
        container.classList.add('book');
        container.setAttribute('id', book.id);
        container.innerHTML = makeBookCard(book);
        mainContainer.append(container)
    })
}


//membuat book list yang dicari
function searchBook(txt){
    const mainContainer = document.querySelector('#search-result-container .results-container');
    mainContainer.innerHTML = null;
    const results = bookList.filter(item =>{
        return item.title.toLowerCase().includes(txt.toLowerCase());
    });
    if(results.length> 0){
        searchResultContainer.classList.remove('hide');
        results.forEach(book =>{
            const container = document.createElement('div');
            container.classList.add('book');
            container.setAttribute('id', book.id);
            container.innerHTML = makeBookCard(book);
            mainContainer.append(container)
        })
    }else{
        showAlert('buku tidak ditemukan');
    }
} 

function makeBookCard(book){
    return(
        `
        <div class="title-container">
            <h3 class="title">${book.title}</h3>
            <p class="author">${book.author}</p>
            <p class="year">${book.year}</p>
        </div>
        <div class="btn-container">
            <button type="button" class="undo-read-btn move" data-id=${book.id} >${book.isComplete? 'Baca lagi' : 'Sudah dibaca'}</button>
            <button type="button" class="edit-book-btn edit" data-id=${book.id} >edit buku</button>
            <button type="button" class="delete-book-btn delete" data-id=${book.id} >hapus buku</button>
        </div>

        `
    )
}


function saveToLocalStorage(data){
    localStorage.setItem("BOOK_LIST", JSON.stringify(data));
}
function getFromLocalStorage(){
   return localStorage.getItem("BOOK_LIST");
}

// membuat toast sederhana
function showAlert(txt){
    alertContainer.classList.remove('hide');
    const alert = alertContainer.querySelector('.alert');
    const alertTxt = alertContainer.querySelector('.alert-text');
    alertTxt.innerHTML = txt;
    alert.classList.replace('not-show', 'show');
    setTimeout(()=>{
        alert.classList.replace('show', 'not-show');
        alertContainer.classList.add('hide');
    },2000)
}