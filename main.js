'use strict'

const input = document.querySelector('input[type="file"]'),
  wrapper = document.querySelector('.wrapper'),
  notice = document.querySelector('.notice');
//проверка на формат файла
const checkFileFormat = (name) => {
  let indTochka = 0, format = "";

  for (let i = 0; i < name.length; ++i) {
    if (name[i] == '.') {
      indTochka = i + 1;
      break;
    }
  }
  for (let i = indTochka; i < name.length; ++i) {
    format += name[i];
  }
  return (format == 'txt') ? true : false;
}
//поиск символа в таблице сдвигов 
const findSymbolInSdvigSymbol = (symbolOfSdvig, symbol) => {
	const dlina = symbolOfSdvig.length;
	for (let i = 0 ; i < dlina; ++i) {
		if (symbolOfSdvig[i] == symbol) {
			return i;
		}
	}
	return -1;
}

const checkSymbol = (str, symbol) => {
	const dlina = str.length;
	for (let i = dlina - 1; i >= 0; --i) {
		if (str[i] == symbol) {
			return dlina - i;
		}
	}
	return -1;
}

const createTableSdvig = (str, subStr, symbolOfSdvig, numberOfSdvig, mas) => {
	let isFounded = false, mainInd = 0;
	const dlinaStroka = str.length, dlinaSubStroka = subStr.length;
	let	konechInd = dlinaSubStroka - 1;

	end: do {
		let newSubStr = "", sdvig = 0;

		for (let i = konechInd - dlinaSubStroka + 1; i <= konechInd; ++i) {
			newSubStr += str[i];
    }
    //console.log(newSubStr);
		//если сразу же нет совпадений 			
		if (newSubStr[dlinaSubStroka - 1] != subStr[dlinaSubStroka - 1]) {
			//если этот символ есть в таблице сдвигов
			if (findSymbolInSdvigSymbol(symbolOfSdvig, newSubStr[dlinaSubStroka - 1]) != -1) {
				let indInSymbolSdvig = findSymbolInSdvigSymbol(symbolOfSdvig, newSubStr[dlinaSubStroka - 1]);
				sdvig = numberOfSdvig[indInSymbolSdvig];
			}
			//если его нет
			else {
				sdvig = dlinaSubStroka;
			}
      konechInd += sdvig;
      mas[mainInd] = sdvig;
		}
		//если есть хотя бы одно совпадение
		else {
			let ind = dlinaSubStroka - 1;
			//пока есть совпадения
			while ((ind >= 0) && (newSubStr[ind] == subStr[ind])) {
				++sdvig;
				--ind;
			}
			//если мы полностью прошли и цикл не прервался
			if (sdvig == dlinaSubStroka) {
				isFounded = true;
				continue end;
			}
			//если прервался, сдвигаем на столько, сколько прошли
			else {
        konechInd += sdvig;
        mas[mainInd] = sdvig;
			}
    }

    ++mainInd;
	} while (!isFounded && konechInd <= dlinaStroka);
	//если мы просто прошли, но не нашли подстроку
	if (!isFounded) {
    return false;
  }
  return true;
}

const showNotice = (text, color) => {
  notice.textContent = text;
  notice.style.backgroundColor = color;
  notice.style.display = 'block';
}

const hideNotice = () => {
  notice.style.display = 'none';
}

//выделение слова
const setInputSelection = (() => {
    const offsetToRangeCharacterMove = (el, offset) => {
        return offset - (el.value.slice(0, offset).split("\r\n").length - 1);
    }

    return (el, startOffset, endOffset) => {
        el.focus();
        if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
            el.selectionStart = startOffset;
            el.selectionEnd = endOffset;
        } else {
            const range = el.createTextRange();
            const startCharMove = offsetToRangeCharacterMove(el, startOffset);
            range.collapse(true);
            if (startOffset == endOffset) {
                range.move("character", startCharMove);
            } else {
                range.moveEnd("character", offsetToRangeCharacterMove(el, endOffset));
                range.moveStart("character", startCharMove);
            }
            range.select();
        }
    };
})();

input.addEventListener('change', () => {
  const file = input.files[0];
  const fileName = file.name;

  if (checkFileFormat(fileName)) {
    const reader = new FileReader();
    reader.readAsText(file);

    reader.addEventListener('load', () => {
      let text = reader.result;
      //удаляю лишние переносы строк
      text = text.replace(/\n/g, '');

      input.parentElement.style.justifyContent = 'initial';

      //создание всех элементов и вставка текста
      const textarea = document.createElement('textarea');
      textarea.classList = 'textarea';
      wrapper.append(textarea);
      textarea.value = text;

      const title = document.createElement('h2');
      title.classList = 'title';
      title.textContent = 'Напишите строку, которую хотите найти';
      wrapper.append(title);

      const input2 = document.createElement('input');
      input2.classList = 'input';
      wrapper.append(input2);

      const button = document.createElement('button');
      button.classList = 'button';
      button.textContent = 'Найти';
      wrapper.append(button);
      
      button.addEventListener('click', () => {
        const subStroka = input2.value, dlinaSubStroka = subStroka.length;
        let dlinaTableSdvig = dlinaSubStroka - 1, ind = 0,
          sdvigSymbol = "", sdvigNumber = [];
        
        if (subStroka) {
          //создание таблицы сдвигов
          for (let i = dlinaSubStroka - 2; i >= 0; --i) {
            if (checkSymbol(sdvigSymbol, subStroka[i]) == -1) {
              sdvigSymbol += subStroka[i];
              sdvigNumber[ind] = dlinaSubStroka - 1 - i;
              ++ind;
            }
            else {
              --dlinaTableSdvig;
            }
          }  
          // //вывод чисто для проверки
          // console.log("their sdvigi");
          // for (let i = 0; i < dlinaTableSdvig ; ++i) {
          //   console.log(sdvigNumber[i]);
          // }
          //console.log("all sdvigi");
          let start = 0, end = 0, table = [];
          if (createTableSdvig(text, subStroka, sdvigSymbol, sdvigNumber, table)) {
            //если нет скролла
            if (textarea.clientHeight == textarea.scrollHeight) {
              showNotice('Ваша строка нашлась', '#41e23e');
            } else {
              showNotice('Ваша строка нашлась, можете проскроллить', '#41e23e');
            }
            //скрыть оповещение через 3 сек
            setTimeout(hideNotice, 3000);
            
            for (let i = 0; i < table.length; ++i) {
              //console.log(table[i]);
              start += table[i];
            }

            end = start + dlinaSubStroka;          
            setInputSelection(textarea, start, end);
            textarea.scrollTop = 0;
          } else {
            showNotice('Здесь нет вашей строки', '#ea2c2c');
            setTimeout(hideNotice, 3000);
          }

        } else {
          alert('Вы не ввели строку');
        }
      })
    })
  } else {
    alert('Неправильный формат файла');
  }
})
