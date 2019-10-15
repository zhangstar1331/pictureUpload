(function($Object, $Function, privates, cls, superclass) {'use strict';
  function Port() {
    var privateObj = $Object.create(cls.prototype);
    $Function.apply(cls, privateObj, arguments);
    privateObj.wrapper = this;
    privates(this).impl = privateObj;
  };
  if (superclass) {
    Port.prototype = Object.create(superclass.prototype);
  }
  return Port;
})