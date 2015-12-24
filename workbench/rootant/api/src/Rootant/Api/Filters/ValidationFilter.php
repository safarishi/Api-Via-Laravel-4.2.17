<?php

namespace Rootant\Api\Filters;

use Illuminate\Support\Facades\Config;
use Illuminate\Validation\Factory as Validator;

use Rootant\Api\Exception\ValidationException;

class ValidationFilter
{

  /**
   * Validator
   *
   * @var Illuminate\Validation\Factory
   */
  protected $validator;

  /**
   * Validator rules
   * @var string|array
   */
  protected $rules = [];

  /**
   * the property name used in auto validate mode
   * @var string
   */
  public $propertyName = '_validate';

  public $controllerName = '';

  public $actionName = '';

  /**
   * validator constuct
   * @param Validator $validator Validator
   */
  public function __construct(Validator $validator)
  {
    $this->validator = $validator;
    // get and set property name from config file
    if ($propertyName = Config::get('api::validation.property_name')) {
      $this->propertyName = $propertyName;
    }
    // get validation rules from config file
    if ($rules = Config::get('api::validation.rules')) {
      $this->rules = $rules;
    }
  }

  /**
   * Run the validation filter
   *
   * @internal param mixed $route, mixed $request
   * @return $response
   */
  public function filter($route, $request)
  {
    $routeParam = explode('@', $route->getActionName());
    $this->controllerName = $routeParam[0];
    $this->actionName = $routeParam[1];
    $this->setControllerRule();

    // get and check the validation rules used in this request
    if (!$rules = $this->getRules()) {
      return;
    }

    $validator = $this->validator->make($request->all(), $rules);
    if ($validator->fails()) {
      $messages = $validator->messages()->all();
      throw new ValidationException($messages);
    }
  }

  private function setControllerRule()
  {
    // check controller is exists
    if (!class_exists($this->controllerName)) {
      return;
    }
    // use reflection class to get the property value
    $controllerRlection = new \ReflectionClass($this->controllerName);
    if (!$controllerRlection->hasProperty($this->propertyName)) {
      return;
    }
    $prop = $controllerRlection->getProperty($this->propertyName);
    $prop->setAccessible(true);
    $controllerRules = $prop->getValue();
    if (!array_key_exists($this->actionName, $controllerRules)) {
      return;
    }
    $this->rules[$this->controllerName] = $controllerRules;
  }

  /**
   * get needed rules
   * @return mixed              validator rules
   */
  private function getRules()
  {
    return !empty($this->rules) ?
      $this->rules[$this->controllerName][$this->actionName] : null;
  }

}