webpackHotUpdate("main",{

/***/ "./src/components/Terms/Terms.js":
/*!***************************************!*\
  !*** ./src/components/Terms/Terms.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _site_data_terms__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../site_data/terms */ "./src/site_data/terms.js");
/* harmony import */ var _site_data_questions__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../site_data/questions */ "./src/site_data/questions.js");
/* harmony import */ var _scss_Terms_scss__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../scss/Terms.scss */ "./src/scss/Terms.scss");
/* harmony import */ var _scss_Terms_scss__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_scss_Terms_scss__WEBPACK_IMPORTED_MODULE_3__);
var _jsxFileName = "/home/tim/Documents/sftool_v3/sftool-ui/src/components/Terms/Terms.js";
 // import queryString from 'query-string';





class Terms extends react__WEBPACK_IMPORTED_MODULE_0___default.a.Component {
  componentDidMount() {
    const hash = this.props.location.hash;
    const element = document.getElementById(hash.replace('#', ''));
    setTimeout(() => {
      window.scrollTo({
        behavior: element ? 'smooth' : 'auto',
        top: element ? element.offsetTop - 56 : 0
      });
    }, 100);
  }

  render() {
    return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("section", {
      className: "terms-container",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 23
      },
      __self: this
    }, _site_data_terms__WEBPACK_IMPORTED_MODULE_1__["default"].map((term, index) => {
      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        key: index,
        id: term.siteId,
        className: "term-container",
        __source: {
          fileName: _jsxFileName,
          lineNumber: 26
        },
        __self: this
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "term-name",
        __source: {
          fileName: _jsxFileName,
          lineNumber: 27
        },
        __self: this
      }, term.term), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "term-definition",
        __source: {
          fileName: _jsxFileName,
          lineNumber: 28
        },
        __self: this
      }, term.definition), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "term-credit",
        __source: {
          fileName: _jsxFileName,
          lineNumber: 29
        },
        __self: this
      }, "Source: ", react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
        href: term.link,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 30
        },
        __self: this
      }, "  ".concat(term.credit))));
    }), _site_data_questions__WEBPACK_IMPORTED_MODULE_2__["default"].map((question, index) => {
      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        key: index,
        id: question.siteId,
        className: "question-container",
        __source: {
          fileName: _jsxFileName,
          lineNumber: 37
        },
        __self: this
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "question-name",
        __source: {
          fileName: _jsxFileName,
          lineNumber: 42
        },
        __self: this
      }, question.question), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "question-answer",
        __source: {
          fileName: _jsxFileName,
          lineNumber: 43
        },
        __self: this
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("ul", {
        className: "question-answer-list",
        __source: {
          fileName: _jsxFileName,
          lineNumber: 44
        },
        __self: this
      }, question.answer.map((answer, index) => {
        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
          key: index,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 46
          },
          __self: this
        }, answer);
      }))), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "question-credit",
        __source: {
          fileName: _jsxFileName,
          lineNumber: 50
        },
        __self: this
      }, "Source: ", react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
        href: question.link,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 51
        },
        __self: this
      }, "  ".concat(question.credit))));
    }));
  }

}

/* harmony default export */ __webpack_exports__["default"] = (Terms);

/***/ })

})
//# sourceMappingURL=main.49b80a9154a28942338e.hot-update.js.map