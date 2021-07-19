import { ModuloModales } from "../../common/ModuloModales.mjs";
import { IdGen } from "../../../common/IdGen.mjs";
import { Utiles } from "../../../common/Utiles.mjs";

let uid;
const slice = [].slice;

export const ngRepeatDirective = [
  "$parse",
  "$animate",
  "$compile",
  "$filter",
  function ($parse, $animate, $compile, $filter) {
    var NG_REMOVED = "$$NG_REMOVED";
    var ngRepeatMinErr = minErr("ngRepeat");

    var updateScope = function (
      scope,
      index,
      valueIdentifier,
      value,
      keyIdentifier,
      key,
      arrayLength
    ) {
      // TODO(perf): generate setters to shave off ~40ms or 1-1.5%
      scope[valueIdentifier] = value;
      if (keyIdentifier) scope[keyIdentifier] = key;
      scope.$index = index;
      scope.$first = index === 0;
      scope.$last = index === arrayLength - 1;
      scope.$middle = !(scope.$first || scope.$last);
      // eslint-disable-next-line no-bitwise
      scope.$odd = !(scope.$even = (index & 1) === 0);
    };

    var getBlockStart = function (block) {
      return block.clone[0];
    };

    var getBlockEnd = function (block) {
      return block.clone[block.clone.length - 1];
    };

    var trackByIdArrayFn = function ($scope, key, value) {
      return hashKey(value);
    };

    var trackByIdObjFn = function ($scope, key) {
      return key;
    };

    return {
      restrict: "A",
      multiElement: true,
      transclude: "element",
      priority: 1000,
      $$tlb: true,
      compile: function ngRepeatCompile($element, $attr) {
        var expression = $attr.dirPtvEditorRepeat;
        var predefined = $attr.predefined;
        var ngRepeatEndComment = $compile.$$createComment(
          "end ngRepeat",
          expression
        );

        var match = expression.match(
          /^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/
        );

        if (!match) {
          throw ngRepeatMinErr(
            "iexp",
            "Expected expression in form of '_item_ in _collection_[ track by _id_]' but got '{0}'.",
            expression
          );
        }

        var lhs = match[1];
        var rhs = match[2];
        var aliasAs = match[3];
        var trackByExp = match[4];

        match = lhs.match(
          /^(?:(\s*[$\w]+)|\(\s*([$\w]+)\s*,\s*([$\w]+)\s*\))$/
        );

        if (!match) {
          throw ngRepeatMinErr(
            "iidexp",
            "'_item_' in '_item_ in _collection_' should be an identifier or '(_key_, _value_)' expression, but got '{0}'.",
            lhs
          );
        }
        var valueIdentifier = match[3] || match[1];
        var keyIdentifier = match[2];

        if (
          aliasAs &&
          (!/^[$a-zA-Z_][$a-zA-Z0-9_]*$/.test(aliasAs) ||
            /^(null|undefined|this|\$index|\$first|\$middle|\$last|\$even|\$odd|\$parent|\$root|\$id)$/.test(
              aliasAs
            ))
        ) {
          throw ngRepeatMinErr(
            "badident",
            "alias '{0}' is invalid --- must be a valid JS identifier which is not a reserved name.",
            aliasAs
          );
        }

        var trackByIdExpFn;

        if (trackByExp) {
          var hashFnLocals = { $id: hashKey };
          var trackByExpGetter = $parse(trackByExp);

          trackByIdExpFn = function ($scope, key, value, index) {
            // assign key, value, and $index to the locals so that they can be used in hash functions
            if (keyIdentifier) hashFnLocals[keyIdentifier] = key;
            hashFnLocals[valueIdentifier] = value;
            hashFnLocals.$index = index;
            return trackByExpGetter($scope, hashFnLocals);
          };
        }

        return function ngRepeatLink(
          $scope,
          $element,
          $attr,
          ctrl,
          $transclude
        ) {
          const partes = /^[^|\s]+/.exec(rhs);
          const refModelo = partes[0];
          const opcionesVacio = $(
            `<button class="invisible btn btn-secondary btn-sm paistv-class-btn-add paistv-only-editor">+<i class="fa fa-pencil"></i></button>`
          );
          opcionesVacio.on("click", function () {
            addItem();
            $scope.$digest();
          });
          const elemOpcionesVacio = opcionesVacio.get(0);
          const comentario = $element[0];
          comentario.parentNode.insertBefore(
            elemOpcionesVacio,
            comentario.nextSibling
          );

          // Store a list of elements from previous run. This is a hash where key is the item from the
          // iterator, and the value is objects with following properties.
          //   - scope: bound scope
          //   - clone: previous element.
          //   - index: position
          //
          // We are using no-proto object so that we don't need to guard against inherited props via
          // hasOwnProperty.
          var lastBlockMap = createMap();

          let originalCollection = null;
          const updateEmptyOptions = function () {
            if (isEmpty()) {
              opcionesVacio.removeClass("invisible");
            } else {
              opcionesVacio.addClass("invisible");
            }
          };
          const isEmpty = function () {
            if (originalCollection instanceof Array) {
              return originalCollection.length == 0;
            } else if (originalCollection instanceof Object) {
              const llaves = Object.keys(originalCollection);
              return llaves.length == 0;
            } else {
              return true;
            }
          };
          const removeItem = async function (key) {
            const acepto = await ModuloModales.confirm();
            if (!acepto) {
              return;
            }
            const llaves = Object.keys(originalCollection);
            for (let i = 0; i < llaves.length; i++) {
              const llave = llaves[i];
              const item = originalCollection[llave];
              if (item.order == key) {
                delete originalCollection[llave];
                $scope.$digest();
                break;
              }
            }
            setTimeout(function() {
              Utiles.ajustarCarusel();
            });
          };
          const addItem = async function (afterThisOrder) {
            if ([null, undefined].indexOf(originalCollection) >= 0) {
              var modelValueSetter = $parse(refModelo).assign;
              originalCollection = {};
              modelValueSetter($scope, originalCollection);
            }
            const newId = await IdGen.nuevo();
            const nuevo = JSON.parse(predefined);
            originalCollection[newId] = nuevo;
            // Acá se debería ajustar el order de los que sean necesarios para
            // ubicarlo en el lugar correcto; antes o después
            nuevo.order = newId;
            if (afterThisOrder) {
              const arreglo = $filter("orderItem")(originalCollection);
              let currentIndex = arreglo.length - 2;
              while (currentIndex > 0) {
                let actual = arreglo[currentIndex];
                if (
                  nuevo.order > actual.order &&
                  actual.order != afterThisOrder
                ) {
                  let paso = actual.order;
                  actual.order = nuevo.order;
                  nuevo.order = paso;
                  currentIndex--;
                } else {
                  break;
                }
              }
            }
            $scope.$digest();
          };
          const moveUpItem = function (key) {
            const arreglo = $filter("orderItem")(originalCollection);
            let actual = null;
            let indice = -1;
            for (let i = 0; i < arreglo.length; i++) {
              if (arreglo[i].order == key) {
                actual = arreglo[i];
                indice = i;
                break;
              }
            }
            if (indice <= 0) {
              return;
            }
            const otroElemento = arreglo[indice - 1];
            actual.order = otroElemento.order;
            otroElemento.order = key;
          };
          const moveDownItem = function (key) {
            const arreglo = $filter("orderItem")(originalCollection);
            let actual = null;
            let indice = -1;
            for (let i = 0; i < arreglo.length; i++) {
              if (arreglo[i].order == key) {
                actual = arreglo[i];
                indice = i;
                break;
              }
            }
            if (indice < 0 || indice == arreglo.length - 1) {
              return;
            }
            const otroElemento = arreglo[indice + 1];
            actual.order = otroElemento.order;
            otroElemento.order = key;
          };
          $scope.$watchCollection(refModelo, function ngRepeatAction(
            localCollection
          ) {
            originalCollection = localCollection;
            updateEmptyOptions();
          });

          //watch props
          $scope.$watchCollection(rhs, function ngRepeatAction(collection) {
            var index,
              length,
              previousNode = $element[0], // node that cloned nodes should be inserted after
              // initialized to the comment node anchor
              nextNode,
              // Same as lastBlockMap but it has the current state. It will become the
              // lastBlockMap on the next iteration.
              nextBlockMap = createMap(),
              collectionLength,
              key,
              value, // key/value of iteration
              trackById,
              trackByIdFn,
              collectionKeys,
              block, // last object information {scope, element, id}
              nextBlockOrder,
              elementsToRemove;

            updateEmptyOptions();

            if (aliasAs) {
              $scope[aliasAs] = collection;
            }

            if (isArrayLike(collection)) {
              collectionKeys = collection;
              trackByIdFn = trackByIdExpFn || trackByIdArrayFn;
            } else {
              trackByIdFn = trackByIdExpFn || trackByIdObjFn;
              // if object, extract keys, in enumeration order, unsorted
              collectionKeys = [];
              for (var itemKey in collection) {
                if (
                  hasOwnProperty.call(collection, itemKey) &&
                  itemKey.charAt(0) !== "$"
                ) {
                  collectionKeys.push(itemKey);
                }
              }
            }

            collectionLength = collectionKeys.length;
            nextBlockOrder = new Array(collectionLength);

            // locate existing items
            for (index = 0; index < collectionLength; index++) {
              key =
                collection === collectionKeys ? index : collectionKeys[index];
              value = collection[key];
              // Value es: {"txt": "<p>Contenido 5</p>","order": "00fz6pjj2kaa"}
              trackById = trackByIdFn($scope, key, value, index);
              if (lastBlockMap[trackById]) {
                // found previously seen block
                block = lastBlockMap[trackById];
                delete lastBlockMap[trackById];
                nextBlockMap[trackById] = block;
                nextBlockOrder[index] = block;
              } else if (nextBlockMap[trackById]) {
                // if collision detected. restore lastBlockMap and throw an error
                forEach(nextBlockOrder, function (block) {
                  if (block && block.scope) lastBlockMap[block.id] = block;
                });
                throw ngRepeatMinErr(
                  "dupes",
                  "Duplicates in a repeater are not allowed. Use 'track by' expression to specify unique keys. Repeater: {0}, Duplicate key: {1}, Duplicate value: {2}",
                  expression,
                  trackById,
                  value
                );
              } else {
                // new never before seen block
                nextBlockOrder[index] = {
                  id: trackById,
                  scope: undefined,
                  clone: undefined,
                };
                nextBlockMap[trackById] = true;
              }
            }

            // Clear the value property from the hashFnLocals object to prevent a reference to the last value
            // being leaked into the ngRepeatCompile function scope
            if (hashFnLocals) {
              hashFnLocals[valueIdentifier] = undefined;
            }

            // remove leftover items
            for (var blockKey in lastBlockMap) {
              block = lastBlockMap[blockKey];
              elementsToRemove = getBlockNodes(block.clone);
              $animate.leave(elementsToRemove);
              if (elementsToRemove[0].parentNode) {
                // if the element was not removed yet because of pending animation, mark it as deleted
                // so that we can ignore it later
                for (
                  index = 0, length = elementsToRemove.length;
                  index < length;
                  index++
                ) {
                  elementsToRemove[index][NG_REMOVED] = true;
                }
              }
              block.scope.$destroy();
            }

            // we are not using forEach for perf reasons (trying to avoid #call)
            for (index = 0; index < collectionLength; index++) {
              key =
                collection === collectionKeys ? index : collectionKeys[index];
              value = collection[key];
              block = nextBlockOrder[index];

              if (block.scope) {
                // if we have already seen this object, then we need to reuse the
                // associated scope/element

                nextNode = previousNode;

                // skip nodes that are already pending removal via leave animation
                do {
                  nextNode = nextNode.nextSibling;
                } while (nextNode && nextNode[NG_REMOVED]);

                if (getBlockStart(block) !== nextNode) {
                  // existing item which got moved
                  $animate.move(getBlockNodes(block.clone), null, previousNode);
                }
                previousNode = getBlockEnd(block);
                updateScope(
                  block.scope,
                  index,
                  valueIdentifier,
                  value,
                  keyIdentifier,
                  key,
                  collectionLength
                );
              } else {
                // new item which we don't know about
                $transclude(function ngRepeatTransclude(clone, scope) {
                  // clone es el nuevo elemento
                  // scope es el scope del clone
                  scope.addItem = addItem;
                  scope.moveUpItem = moveUpItem;
                  scope.moveDownItem = moveDownItem;
                  scope.removeItem = removeItem;

                  var nuevoElem = $(`<div class=" dropleft paistv-editor-repeat-action">\
                    <!-- paistv-editor { -->\
                    <button class="btn btn-secondary btn-sm dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\
                      <i class="fa fa-pencil"></i>\
                    </button>\
                    <div class="dropdown-menu">\
                      <a class="manito dropdown-item pais-tv-menu-item" ng-click="addItem(value.order)">(+) Agregar</a>\
                      <a class="manito dropdown-item pais-tv-menu-item" ng-click="moveUpItem(value.order)">Mover adelante</a>\
                      <a class="manito dropdown-item pais-tv-menu-item" ng-click="moveDownItem(value.order)">Mover atrás</a>\
                      <a class="manito dropdown-item pais-tv-menu-item" ng-click="removeItem(value.order)">(-) Borrar</a>\
                    </div>\
                    <!-- paistv-editor } -->\
                  </div>`);
                  if ($(clone[0]).hasClass('carousel-item')) {
                    Utiles.ajustarCarusel();
                  }
                  $(clone[0]).append(nuevoElem);
                  $compile(nuevoElem)(scope);

                  block.scope = scope;
                  // http://jsperf.com/clone-vs-createcomment
                  var endNode = ngRepeatEndComment.cloneNode(false);
                  clone[clone.length++] = endNode;

                  $animate.enter(clone, null, previousNode);
                  previousNode = endNode;
                  // Note: We only need the first/last node of the cloned nodes.
                  // However, we need to keep the reference to the jqlite wrapper as it might be changed later
                  // by a directive with templateUrl when its template arrives.
                  block.clone = clone;
                  nextBlockMap[block.id] = block;
                  updateScope(
                    block.scope,
                    index,
                    valueIdentifier,
                    value,
                    keyIdentifier,
                    key,
                    collectionLength
                  );
                });
              }
            }
            lastBlockMap = nextBlockMap;
          });
        };
      },
    };
  },
];

var minErrConfig = {
  objectMaxDepth: 5,
  urlErrorParamsEnabled: true,
};

function isFunction(value) {
  return typeof value === "function";
}

function toDebugString(obj, maxDepth) {
  if (typeof obj === "function") {
    return obj.toString().replace(/ \{[\s\S]*$/, "");
  } else if (isUndefined(obj)) {
    return "undefined";
  } else if (typeof obj !== "string") {
    return serializeObject(obj, maxDepth);
  }
  return obj;
}

function sliceArgs(args, startIndex) {
  return slice.call(args, startIndex || 0);
}

function minErr(module, ErrorConstructor) {
  ErrorConstructor = ErrorConstructor || Error;

  var url = "https://errors.angularjs.org/1.8.2/";
  var regex = url.replace(".", "\\.") + "[\\s\\S]*";
  var errRegExp = new RegExp(regex, "g");

  return function () {
    var code = arguments[0],
      template = arguments[1],
      message = "[" + (module ? module + ":" : "") + code + "] ",
      templateArgs = sliceArgs(arguments, 2).map(function (arg) {
        return toDebugString(arg, minErrConfig.objectMaxDepth);
      }),
      paramPrefix,
      i;

    // A minErr message has two parts: the message itself and the url that contains the
    // encoded message.
    // The message's parameters can contain other error messages which also include error urls.
    // To prevent the messages from getting too long, we strip the error urls from the parameters.

    message += template.replace(/\{\d+\}/g, function (match) {
      var index = +match.slice(1, -1);

      if (index < templateArgs.length) {
        return templateArgs[index].replace(errRegExp, "");
      }

      return match;
    });

    message += "\n" + url + (module ? module + "/" : "") + code;

    if (minErrConfig.urlErrorParamsEnabled) {
      for (
        i = 0, paramPrefix = "?";
        i < templateArgs.length;
        i++, paramPrefix = "&"
      ) {
        message +=
          paramPrefix + "p" + i + "=" + encodeURIComponent(templateArgs[i]);
      }
    }

    return new ErrorConstructor(message);
  };
}

function createMap() {
  return Object.create(null);
}

function isArrayLike(obj) {
  // `null`, `undefined` and `window` are not array-like
  if (obj == null || isWindow(obj)) return false;

  // arrays, strings and jQuery/jqLite objects are array like
  // * jqLite is either the jQuery or jqLite constructor function
  // * we have to check the existence of jqLite first as this method is called
  //   via the forEach method when constructing the jqLite object in the first place
  if (isArray(obj) || isString(obj) || (jqLite && obj instanceof jqLite))
    return true;

  // Support: iOS 8.2 (not reproducible in simulator)
  // "length" in obj used to prevent JIT error (gh-11508)
  var length = "length" in Object(obj) && obj.length;

  // NodeList objects (with `item` method) and
  // other objects with suitable length characteristics are array-like
  return (
    isNumber(length) &&
    ((length >= 0 && length - 1 in obj) || typeof obj.item === "function")
  );
}

function isWindow(obj) {
  return obj && obj.window === obj;
}

var isArray = Array.isArray;

function forEach(obj, iterator, context) {
  var key, length;
  if (obj) {
    if (isFunction(obj)) {
      for (key in obj) {
        if (
          key !== "prototype" &&
          key !== "length" &&
          key !== "name" &&
          obj.hasOwnProperty(key)
        ) {
          iterator.call(context, obj[key], key, obj);
        }
      }
    } else if (isArray(obj) || isArrayLike(obj)) {
      var isPrimitive = typeof obj !== "object";
      for (key = 0, length = obj.length; key < length; key++) {
        if (isPrimitive || key in obj) {
          iterator.call(context, obj[key], key, obj);
        }
      }
    } else if (obj.forEach && obj.forEach !== forEach) {
      obj.forEach(iterator, context, obj);
    } else if (isBlankObject(obj)) {
      // createMap() fast path --- Safe to avoid hasOwnProperty check because prototype chain is empty
      for (key in obj) {
        iterator.call(context, obj[key], key, obj);
      }
    } else if (typeof obj.hasOwnProperty === "function") {
      // Slow path for objects inheriting Object.prototype, hasOwnProperty check needed
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          iterator.call(context, obj[key], key, obj);
        }
      }
    } else {
      // Slow path for objects which do not have a method `hasOwnProperty`
      for (key in obj) {
        if (hasOwnProperty.call(obj, key)) {
          iterator.call(context, obj[key], key, obj);
        }
      }
    }
  }
  return obj;
}

function hashKey(obj, nextUidFn) {
  var key = obj && obj.$$hashKey;

  if (key) {
    if (typeof key === "function") {
      key = obj.$$hashKey();
    }
    return key;
  }

  var objType = typeof obj;
  if (objType === "function" || (objType === "object" && obj !== null)) {
    key = obj.$$hashKey = objType + ":" + (nextUidFn || nextUid)();
  } else {
    key = objType + ":" + obj;
  }

  return key;
}

function nextUid() {
  return ++uid;
}

function isUndefined(value) {
  return typeof value === "undefined";
}

function serializeObject(obj, maxDepth) {
  var seen = [];

  // There is no direct way to stringify object until reaching a specific depth
  // and a very deep object can cause a performance issue, so we copy the object
  // based on this specific depth and then stringify it.
  if (isValidObjectMaxDepth(maxDepth)) {
    // This file is also included in `angular-loader`, so `copy()` might not always be available in
    // the closure. Therefore, it is lazily retrieved as `angular.copy()` when needed.
    obj = angular.copy(obj, null, maxDepth);
  }
  return JSON.stringify(obj, function (key, val) {
    val = toJsonReplacer(key, val);
    if (isObject(val)) {
      if (seen.indexOf(val) >= 0) return "...";

      seen.push(val);
    }
    return val;
  });
}

function isValidObjectMaxDepth(maxDepth) {
  return isNumber(maxDepth) && maxDepth > 0;
}

function isNumber(value) {
  return typeof value === "number";
}

function toJsonReplacer(key, value) {
  var val = value;

  if (
    typeof key === "string" &&
    key.charAt(0) === "$" &&
    key.charAt(1) === "$"
  ) {
    val = undefined;
  } else if (isWindow(value)) {
    val = "$WINDOW";
  } else if (value && window.document === value) {
    val = "$DOCUMENT";
  } else if (isScope(value)) {
    val = "$SCOPE";
  }

  return val;
}

function isScope(obj) {
  return obj && obj.$evalAsync && obj.$watch;
}

function isObject(value) {
  // http://jsperf.com/isobject4
  return value !== null && typeof value === "object";
}

function getBlockNodes(nodes) {
  // TODO(perf): update `nodes` instead of creating a new object?
  var node = nodes[0];
  var endNode = nodes[nodes.length - 1];
  var blockNodes;

  for (var i = 1; node !== endNode && (node = node.nextSibling); i++) {
    if (blockNodes || nodes[i] !== node) {
      if (!blockNodes) {
        blockNodes = jqLite(slice.call(nodes, 0, i));
      }
      blockNodes.push(node);
    }
  }

  return blockNodes || nodes;
}
