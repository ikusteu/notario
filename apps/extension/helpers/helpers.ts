interface BookEntry {
  isbn: string;
  title?: string;
  price?: number;
  year?: string;
  authors?: string;
  publisher?: string;
}

type NodeWithNextSibling = Node & {
  nextSibling: NodeWithNextSibling | null;
}

/**
 * 
 * @param rawHTML 
 * @returns 
 * top_box
: 
author
: 
"Stephenson, Neal"
cover_url
: 
"https://images.isbndb.com/covers/28/04/9780060512804.jpg"
description
: 
"With this extraordinary first volume in what promises to be an epoch-making masterpiece, Neal Stephenson hacks into the secret histories of nations and the private obsessions of men, decrypting with dazzling virtuosity the forces that shaped this century.\n In 1942, Lawrence Pritchard Waterhouse — mathematical genius and young Captain in the U.S. Navy — is assigned to detachment 2702. It is an outfit so secret that only a handful of people know it exists, and some of those people have names like Churchill and Roosevelt. The mission of Waterhouse and Detatchment 2702 — commanded by Marine Raider Bobby Shaftoe — is to keep the Nazis ignorant of the fact that Allied Intelligence has cracked the enemy's fabled Enigma code. It is a game, a cryptographic chess match between Waterhouse and his German counterpart, translated into action by the gung-ho Shaftoe and his forces.\n\n\n Fast-forward to the present, where Waterhouse's crypto-hacker grandson, Randy, is attempting to create a \"data haven\" in Southeast Asia — a place where encrypted data can be stored and exchanged free of repression and scrutiny. As governments and multinationals attack the endeavor, Randy joins forces with Shaftoe's tough-as-nails granddaughter, Amy, to secretly salvage a sunken Nazi submarine that holds the key to keeping the dream of a data haven afloat. But soon their scheme brings to light a massive conspiracy with its roots in Detachment 2702 linked to an unbreakable Nazi code called Arethusa. And it will represent the path to unimaginable riches and a future of personal and digital liberty...or to universal totalitarianism reborn.\n\n\n A breathtaking tour de force, and Neal Stephenson's mostaccomplished and affecting work to date.|"
publisher_and_edition
: 
"Avon Books, Reprint, 2002"
title
: 
"Cryptonomicon"
top_row
: 
"English [en]"
 */
export function annasArchiveScraper(rawHTML: Document): BookEntry {
  let book: BookEntry = {
    isbn: "",
    title: "",
    authors: "",
    price: 0,
    publisher: "",
    year: "",
  };


  let pElement = Array.from(rawHTML.querySelectorAll("p")).find(
    (p) => {

      return p.textContent && p.textContent.trim() === "This is the raw JSON used to render this page."
    }
  );

  let siblingDiv: HTMLDivElement | null = null;

  let json: { author?: string, cover_url?: string; description?: string; publisher_and_edition: string; title?: string };
  if (pElement) {
    let sibling = pElement.nextSibling;
    let innerDivHtml: string

    while (sibling) {

      if (sibling.nodeName.toLowerCase() === "div") {
        siblingDiv = sibling as HTMLDivElement;
        innerDivHtml = siblingDiv.innerHTML
        let decodedString = decodeURIComponent(encodeURIComponent(innerDivHtml));
        decodedString = decodedString.replace(/<br>/g, '')
          .replace(/&nbsp;/g, '');

        try {
          json = JSON.parse(decodedString)["top_box"]
          book.authors = json.author;
          book.title = json.title

          // publisher_and_edition: "Avon Books, Reprint, 2002"
          const publisher_and_edition = json.publisher_and_edition.split(",");

          if (publisher_and_edition.length) {
            book.publisher = publisher_and_edition[0]
            book.year = publisher_and_edition.length > 1 ? publisher_and_edition[publisher_and_edition.length - 1] : "";
          }

        } catch (error) {
          console.error("Parsing error:", error);
        }
        break;
      }
      sibling = sibling.nextSibling;
    }
  }

  return book;
}
export function libreriauniversitariaScraper(rawHTML: Document): BookEntry {

  const parent = rawHTML.querySelector('.search-details-ricerca');

  let book: BookEntry = {
    isbn: "",
    title: "",
    authors: "",
    price: 0,
    publisher: "",
    year: "",
  };

  if (!parent) {
    console.log("No element with class 'search-details-ricerca' was found");
    return book;
  }

  const children = Array.from(parent.children) as HTMLElement[];
  let result: Record<string, string[]> = {};

  /**
   * {
    "product_title": [
        "Cryptonomicon"
    ],
    "search-author-publisher": [
        "Neal Stephenson",
        "Harper Collins Publ. USA"
    ],
    "info-prezzosconto": [
        ""
    ],
    "product_shopping_cart_small": [
        ""
    ],
    "free-shipping": [
        "",
        ""
    ],
    "available-in": [
        ""
    ]
}
   */

  for (let child of children) {
    const childClass = child.className;
    const grandChildren = Array.from(child.querySelectorAll<HTMLElement>(':scope > *')); // get immediate children only
    if (grandChildren.length > 0) {
      result[childClass] = grandChildren.map(grandChild => grandChild.title || "");
    }
    else {
      result[childClass] = [child.title] || "";
    }
  }

  book.title = result["product_title"][0]

  const authorAndPublisher = result["search-author-publisher"];
  book.publisher = result["search-author-publisher"][authorAndPublisher.length - 1]

  for (let i = 0; i < authorAndPublisher.length - 1; i++) {
    book.authors = book.authors + `, ${authorAndPublisher[i]}`
  }

  return book;
}


type ExtractedData = {
  datePublished?: string;
  publisher?: string;
  name?: string;
  authors?: string[];
};

export function openLibraryScraper(doc: Document): BookEntry {

  const datePublishedEl = doc.querySelector('span[itemprop="datePublished"]');
  const publisherEl = doc.querySelector('a[itemprop="publisher"]');
  const workTitleAndAuthorEl = doc.querySelector('div.work-title-and-author.desktop');


  let book: BookEntry = {
    isbn: "",
    title: "",
    authors: "",
    price: 0,
    publisher: "",
    year: "",
  };

  /**
   * {
    "datePublished": "2023",
    "publisher": "Scholastic, Incorporated",
    "name": "Harry Potter and the Sorcerer's Stone (Harry Potter, Book 1)",
    "authors": [
        "J. K. Rowling",
        "Mary GrandPré"
    ]
}
   */
  if (datePublishedEl) {
    book.year = datePublishedEl.textContent?.trim();
  }

  if (publisherEl) {
    book.publisher = publisherEl.textContent?.trim();
  }

  if (workTitleAndAuthorEl) {
    const nameEl = workTitleAndAuthorEl.querySelector('[itemprop="name"]');
    const authorsEls = workTitleAndAuthorEl.querySelectorAll('[itemprop="author"]');

    if (nameEl) {
      book.title = nameEl.textContent?.trim();
    }

    if (authorsEls.length > 0) {
      book.authors = Array.from(authorsEls).map(el => el.textContent?.trim() || '').join(", ");
    }
  }

  return book;
}

type genLibData = {
  title?: string;
  authors?: string;
  publisher?: string;
  year?: string;
};

/** @TODO make this work at some point */
export function libGenScraper(doc: Document): genLibData | null {

  const bodyText = doc.body.textContent || '';
  if (!bodyText.includes('files found')) {
    console.log("No result found")
    return null;
  }


  const tables = doc.querySelectorAll('table');
  let extractedData: genLibData = {};

  tables.forEach(table => {
    // console.log(table.innerText)
    if (table.textContent?.includes('ID')) {
      const innerTable = table.querySelector('table');
      if (!innerTable) {
        return;
      }
      const tdEls = Array.from(innerTable.querySelectorAll('td'));

      tdEls.forEach((tdEl, index) => {
        const tdText = tdEl.innerText?.trim() || '';

        switch (tdText) {
          case 'Title':
            extractedData.title = tdEls[index + 1]?.innerText?.trim();
            break;
          case 'Author(s):':
            extractedData.authors = tdEls[index + 1]?.innerText?.trim();
            break;
          case 'Publisher:':
            extractedData.publisher = tdEls[index + 1]?.innerText?.trim();
            break;
          case 'Year:':
            extractedData.year = tdEls[index + 1]?.innerText?.trim();
            break;

        }
      });
    }
  });

  return extractedData;
}



export function fetchUrl(url: string, senderResponse: (response?: any) => void) {
  fetch(url)
    .then((res) => res.text().then((text) => ({ url: url, body: text }))
      .then((res) => {
        // handle serialization here because otherwise
        // the html gets messed up in the sending process
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          const activeTab = tabs[0];
          console.log({ activeTab });
          if (activeTab.id) {
            chrome.tabs.sendMessage(activeTab.id, JSON.stringify(res));

          }
        });
        senderResponse(`message sent back from ${url}`);
      }
      ));
}


export function biblioScraper(document: Document): BookEntry {


  let book: BookEntry = {
    isbn: "",
    title: "",
    authors: "",
    price: 0,
    publisher: "",
    year: "",
  };

  const itemProps = ["name", "author", "about", "datePublished", "isbn"];

  const result: Record<string, string> = {};

  for (const prop of itemProps) {
    const element: HTMLMetaElement | null = document.querySelector(`[itemprop=${prop}]`);

    if (element) {
      result[prop] = element.content;
    }
  }

  book.authors = result["author"]
  book.title = result["name"]
  book.publisher = result["about"].split(",")[0]
  book.year = result["datePublished"]
  book.isbn = result["isbn"]

  return book;
}