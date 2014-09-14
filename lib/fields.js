var _ = require("lodash"),
  DataModel = require("./models"),
  List = require("./list"),
  collections = require("./collections"),
  React = React || {Proptypes: null};

function defaultsToValues (t) {
  switch(t) {
    case React.PropTypes.array:
      return [];
    case React.PropTypes.bool:
      return false;
    case React.PropTypes.number:
      return 0;
    case React.PropTypes.string:
      return "";
    case React.PropTypes.object:
      return {};
  }
}


/**
 * @param {DataEmitter} Model
 * @param {Object} props
 * @param {string} propName
 * @param {string} componentName
 * @returns {Error}
 */
function checkType(Model, props, propName, componentName) {
  var prop = props[propName];
  if (_.isNull(prop)) {
    return;
  }
  if (Model.prototype.isPrototypeOf(prop)) {
    return new Error("Validation failed: " + propName + " " + componentName);
  }
}

/**
 * @type {{modelProp: modelProp, listProp: listProp, collectionProp: collectionProp}}
 */
FieldTypes = _.extend({
  model: _.partial(checkType, DataModel),
  collection: _.partial(checkType, collections.DataCollection),
  list: _.partial(checkType, List),
}, React.Proptypes);

module.exports = {
  FieldTypes: FieldTypes,
  checkType: checkType,
  defaultsToValues: defaultsToValues,
};