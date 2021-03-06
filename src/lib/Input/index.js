import React from 'react';
import PropTypes from 'prop-types';
import { omit } from 'lodash';
import {
  Icon,
  InputError,
  InputHelper,
  Label,
 } from '@collab-ui/react';

/**
 * @category controls
 * @component input
 * @variations collab-ui-react
 */

const determineErrorType = array => {
  return array.reduce((agg, e) => {
    return agg === 'error' ? agg : e.type || '';
  }, '');
};

const filterErrorsByType = (array, value) => {
  return array.reduce(
    (agg, e) => (e.type === value ? agg.concat(e.error) : agg),
    []
  );
};

/** Text input with integrated label to enforce consistency in layout, error display, label placement, and required field marker. */
class Input extends React.Component {
  static displayName = 'Input';

  state = {
    isEditing: false,
    value: this.props.value,
  };

  componentDidUpdate (prevProps) {
    const { value } = this.props;

    value !== prevProps.value
    && this.setValue(value);
  }

  setValue = value => {
    this.setState({
      value
    });
  };

  handleKeyDown = e => {
    const { onKeyDown } = this.props;
    onKeyDown && onKeyDown(e);
  };

  handleFocus = e => {
    const { onFocus, disabled } = this.props;

    if (disabled) {
      e.stopPropagation();
      return;
    }

    if (onFocus) {
      onFocus(e);
    }
    this.setState({
      isEditing: true,
    });
  };

  handleMouseDown = e => {
    const { onMouseDown, disabled } = this.props;

    if (disabled) {
      e.stopPropagation();
      return;
    }

    if (onMouseDown) {
      onMouseDown(e);
    }
    this.setState({
      isEditing: true,
    });
  };

  handleChange = e => {
    const { onChange } = this.props;
    const value = e.target.value;
    e.persist();
    this.setState(() => {
      onChange && onChange(e);
      return { value };
    });
  };

  handleBlur = e => {
    const { onDoneEditing } = this.props;
    const value = e.target.value;
    e.stopPropagation();
    e.preventDefault();

    if (e.keyCode === 27 || e.keyCode === 13 || e.type === 'blur') {
      this.setState({ isEditing: false });

      if (onDoneEditing) {
        onDoneEditing(value);
      }
    }
  };

  handleClear = e => {
    const value = '';
    e.target.value = value;
    e.persist();
    this.input.focus();
    this.handleChange(e);
  };

  setInputRef = input => {
    const { clear, inputRef } = this.props;
    if (clear)  this.input = input;
    if (inputRef) return inputRef(input);
  }

  render() {
    const {
      children,
      className,
      clear,
      clearAriaLabel,
      defaultValue,
      disabled,
      errorArr,
      htmlId,
      id,
      inputClassName,
      inputHelpText,
      inputSize,
      label,
      nestedLevel,
      placeholder,
      readOnly,
      secondaryLabel,
      theme,
      type,
      ...props
    } = this.props;
    const { value } = this.state;

    const otherProps = omit({ ...props }, [
      'inputRef',
      'onChange',
      'onDoneEditing',
      'onFocus',
      'onKeyDown',
      'onMouseDown',
      'ref',
      'value',
    ]);

    const errorType =
      (errorArr.length > 0 && determineErrorType(errorArr)) || '';
    const errors = (errorType && filterErrorsByType(errorArr, errorType)) || [];

    const secondaryLabelWrapper = () => {
      return (
        <div className="cui-label__secondary-label-container">
          {inputElement}
          <Label
            className="cui-label__secondary-label"
            htmlFor={htmlId}
            label={secondaryLabel}
            theme={theme}
          />
        </div>
      );
    };
    
    const clearButton = (clear && !disabled && value) && (
      <Icon
        name="clear-active_16"
        onClick={this.handleClear}
        ariaLabel={clearAriaLabel || 'clear input'}
      />
    );

    const iconContainer = () => {
      return (
        <div className='cui-input__icon-container'>
          {inputElement}
          {children}
          {clearButton}
        </div>
      );
    };

    const inputElement = (
      <input
        className={
          'cui-input' +
          `${inputClassName ? ` ${inputClassName}` : ''}` +
          `${readOnly ? ' read-only' : ''}` +
          `${disabled ? ' disabled' : ''}` +
          `${value ? ` dirty` : ''}`
        }
        type={type}
        onKeyDown={this.handleKeyDown}
        onBlur={this.handleBlur}
        onFocus={this.handleFocus}
        onMouseDown={this.handleMouseDown}
        placeholder={placeholder}
        value={value || defaultValue}
        onChange={this.handleChange}
        ref={this.setInputRef}
        disabled={disabled}
        readOnly={readOnly}
        tabIndex={0}
        {...htmlId && { id: htmlId }}
        {...otherProps}
      />
    );

    const getInputWrapper = () => {
      if (clear || children) return iconContainer();
      if (secondaryLabel) return secondaryLabelWrapper();
      return inputElement;
    };

    return (
      <div
        className={
          `cui-input-group` +
          ` ${inputSize}` +
          `${inputSize ? ' columns' : ''}` +
          `${readOnly ? ' read-only' : ''}` +
          `${disabled ? ' disabled' : ''}` +
          `${(theme && ` cui-input-group--${theme}`) || ''}` +
          `${errorType ? ` ${errorType}` : ''}` +
          `${(nestedLevel && ` cui-input--nested-${nestedLevel}`) || ''}` +
          `${className ? ` ${className}` : ''}`
        }
      >
        {
          label &&
          <Label
            className="cui-label"
            htmlFor={htmlId || id}
            label={label}
            theme={theme}
          />
        }
        {getInputWrapper()}
        {inputHelpText && <InputHelper message={inputHelpText} />}
        {errors &&
          errors.map((e, i) => (
            <InputError error={e} key={`input-error-${i}`} />
          ))}
      </div>
    );
  }
}

Input.defaultProps = {
  children: '',
  className: '',
  clear: false,
  clearAriaLabel: null,
  defaultValue: '',
  disabled: false,
  errorArr: [],
  inputClassName: '',
  inputHelpText: '',
  inputRef: null,
  inputSize: '',
  label: '',
  name: null,
  nestedLevel: 0,
  onChange: null,
  onDoneEditing: null,
  onFocus: null,
  onKeyDown: null,
  onMouseDown: null,
  placeholder: '',
  readOnly: false,
  secondaryLabel: '',
  theme: '',
  type: 'text',
  value: '',
};

Input.propTypes = {
  /** Child component to display next to the input */
  children: PropTypes.node,
  /** Div Input ClassName */
  className: PropTypes.string,
  /** Clear */
  clear: PropTypes.bool,
  /** Optional aria label on the clear button */
  clearAriaLabel: PropTypes.string,
  /** Default Value same as value but used when onChange isn't */
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /*** optional disabled prop type */
  disabled: PropTypes.bool,
  /** Includes Array of Objects with error and type
   [{error: '', type: ''}] to display
   error message and assign class
   */
  errorArr: PropTypes.array,
  /** Unique HTML ID. Used for tying label to HTML input. Handy hook for automated testing. */
  htmlId: PropTypes.string,
  /** Unique HTML ID. Used for tying label to HTML input. */
  id: PropTypes.string,
  /** Div Input ClassName */
  inputClassName: PropTypes.string,
  /** Help Text to show form validation rules */
  inputHelpText: PropTypes.string,
  /*** optional ref prop type */
  inputRef: PropTypes.func,
  /** Overall input group size. */
  inputSize: PropTypes.string,
  /** Input label */
  label: PropTypes.string,
  /*** optional name prop type */
  name: PropTypes.string,
  /*** optional nextLevel prop type */
  nestedLevel: PropTypes.number,
  /** Function to call onChange */
  onChange: PropTypes.func,
  /*** optional function for blur prop type */
  onDoneEditing: PropTypes.func,
  /*** optional function for focus prop type */
  onFocus: PropTypes.func,
  /*** optional function for key up event */
  onKeyDown: PropTypes.func,
  /*** optional function for mouse down event */
  onMouseDown: PropTypes.func,
  /** Placeholder to display when empty */
  placeholder: PropTypes.string,
  /*** optional read-only prop type */
  readOnly: PropTypes.bool,
  /** Secondary Input label */
  secondaryLabel: PropTypes.string,
  /** theme prop type */
  theme: PropTypes.string,
  /** Input type */
  type: PropTypes.oneOf(['text', 'number', 'password', 'email']),
  /** Value */
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default Input;

/**
* @name Default Input
* @description Inputs are useful.
*
* @category controls
* @component input
* @section default
*
* @js

export default class Default extends React.PureComponent {

  render() {
    return (
      <div className='row'>
      <Input
        name='defaultInput'
        label='Default Input'
        htmlId='defaultInput'
        inputSize='small-5'
        placeholder='Placeholder Text'
      />
    </div>
    );
  }
}

**/

/**
* @name Input Type = Number
* @description Inputs are useful.
*
* @category controls
* @component input
* @section number
*
* @js

export default class Default extends React.PureComponent {
  render() {
    return (
      <div className='row'>
      <Input
        name='input2'
        label='Number Input'
        htmlId='input2'
        type='number'
      />
    </div>
    );
  }
}

**/

/**
* @name Input Type = Password
* @description Inputs are useful.
*
* @category controls
* @component input
* @section Type Attribute
*
* @js

export default class Default extends React.PureComponent {
  render() {
    return (
      <div className='row'>
      <Input
        name='input3'
        label='Password Input'
        htmlId='input3'
        type='password'
      />
    </div>
    );
  }
}

**/

/**
* @name Input Size
* @description Inputs are useful.
*
* @category controls
* @component input
* @section inputSize Attribute
*
* @js

export default function InputSize() {
  return (
    <div className='row'>
      <Input
        name='input4'
        label='Large Input'
        htmlId='input4'
        inputSize='medium-12'
      />
    </div>
  );
}

**/

/**
* @name Input Secondary Label
* @description Inputs are useful.
*
* @category controls
* @component input
* @section secondary-label
*
* @js

export default function InputSecondary() {
  return (
    <div className='row'>
      <Input
        name='inputSecondaryLabel'
        label='Input with Secondary Label'
        htmlId='inputSecondaryLabel'
        inputSize='small-5'
        secondaryLabel='Secondary Label'
      />
    </div>
  );
}

**/

/**
* @name Input Required
* @description Inputs are useful.
*
* @category controls
* @component input
* @section Required Attribute
*
* @js

export default function InputRequired() {
  return (
    <div className='row'>
      <Input
        name='input6'
        label='Required Input'
        htmlId='input6'
        required
      />
    </div>
  );
}

**/

/**
* @name Input Placeholder
* @description Inputs are useful.
*
* @category controls
* @component input
* @section placeholder Attribute
*
* @js

export default function InputPlaceholder() {
  return (
    <div className='row'>
      <Input
        name='input7'
        label='Placeholder Input'
        htmlId='input7'
        placeholder='Placeholder'
      />
    </div>
  );
}

**/

/**
* @name Input Help Text
* @description Inputs are useful.
*
* @category controls
* @component input
* @section help-text
*
* @js

export default function InputHelp() {
  return (
    <div className='row'>
      <Input
        name='inputHelpText'
        label='Help Text Input'
        htmlId='inputHelpText'
        inputSize='small-5'
        inputHelpText='Help Text'
      />
    </div>
  );
}

**/

/**
* @name Input Disabled
* @description Inputs are useful.
*
* @category controls
* @component input
* @section disabled
*
* @js

export default function InputDisabled() {
  return (
    <div className='row'>
      <Input
        name='inputDisabled'
        label='Disabled Input'
        htmlId='inputDisabled'
        inputSize='small-5'
        value='Disabled Text'
        disabled
      />
    </div>
  );
}

**/

/**
* @name Input Read Only
* @description Inputs are useful.
*
* @category controls
* @component input
* @section read-only
*
* @js

export default function InputReadonly() {
  return (
    <div className='row'>
      <Input
        name='inputReadonly'
        label='Read Only Input'
        htmlId='inputReadonly'
        inputSize='small-5'
        value='Read Only Text'
        readOnly
      />
    </div>
  );
}

**/

/**
* @name Input Nested
* @description Inputs are useful.
*
* @category controls
* @component input
* @section nested
*
* @js

export default function InputNested() {
  return (
    <div className='row' key={'input1'}>
      <Input
        name='inputParent'
        label='Parent Input Example'
        htmlId='inputParent'
        inputSize='small-5'
      />
    </div>,
    <div className='row' key={'input2'}>
      <Input
        name='inputNested1'
        label='Child Input Nested 1 Level'
        inputSize='small-5'
        htmlId='inputNested1'
        nestedLevel={1}
      />
    </div>,
    <div className='row' key={'input3'}>
      <Input
        name='inputNested2'
        label='Child Input Nested 2 Levels'
        inputSize='small-5'
        htmlId='inputNested2'
        nestedLevel={2}
      />
    </div>,
    <div className='row' key={'input4'}>
      <Input
        name='inputNested3'
        label='Child Input Nested 3 Levels'
        inputSize='small-5'
        htmlId='inputNested3'
        nestedLevel={3}
      />
    </div>
  );
}

**/

/**
* @name Input Error (Warning)
* @description Inputs are useful.
*
* @category controls
* @component input
* @section warning
*
* @js

export default function InputError() {
  return (
    <div className='row'>
      <Input
        name='inputWarning'
        label='Error (Warning) Input'
        htmlId='inputWarning'
        inputSize='small-5'
        errorArr={ [{error: 'This is where the warning message would be.', type: 'warning'}] }
      />
    </div>
  );
}

**/

/**
* @name Input Error (Error)
* @description Inputs are useful.
*
* @category controls
* @component input
* @section error
*
* @js

export default function InputError() {
  return (
    <div className='row'>
      <Input
        name='inputError'
        label='Error (Error) Input'
        htmlId='inputError'
        inputSize='small-5'
        errorArr={ [{error: 'This is where the error message would be.', type: 'error'}] }
      />
    </div>
  );
}

**/

/**
* @name Input Error (Success)
* @description Inputs are useful.
*
* @category controls
* @component input
* @section success
*
* @js

export default function InputError() {
  return (
    <div className='row'>
      <Input
        name='inputSuccess'
        label='Error (Success) Input'
        htmlId='inputSuccess'
        inputSize='small-5'
        errorArr={ [{error: 'This is where the success message would be.', type: 'success'}] }
      />
    </div>
  );
}

**/

/**
* @name Advanced Validation
* @description Example of advanced validation.
*
* @category controls
* @component input
* @section advanced-validation
*
* @js

export default class Form extends React.PureComponent {
  constructor() {
    super();

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.validateField = this.validateField.bind(this);
    this.removeElement = this.removeElement.bind(this);
    this.retrieveState = this.retrieveState.bind(this);
    this.addElement = this.addElement.bind(this);
    this.createErrorArr = this.createErrorArr.bind(this);
  }

  state = {
    testMe: '',
    testMeError: []
  }

  handleChange(value) {
    this.setState({
      testMe: value
    });
  }

  handleSubmit(event) {
    event && event.preventDefault();
    this.validateField('testMe', this.state.testMe);
  }

  retrieveState() {
    return this.state;
  }

  addElement(array, element) {
    return array.includes(element)
    ? [...array]
    : [...array, element];
  }

  removeElement(array, element) {
    return array.filter((ele) => ele !== element);
  }

  createErrorArr(validationArr, value) {
    return validationArr.reduce((agg, e) =>
      value.match(e.test)
      ? this.removeElement(agg, e)
      : this.addElement(agg, e)
    , []);
  }

  validateField(fieldName, value, cb) {
    const rules = {
      testMe: {
        validation: [
          {
            error: 'Preferred if TestMe Field is 8 characters',
            test: '^[a-zA-Z]{8,}$',
            type: 'warning'
          },
          {
            error: 'TestMe Field is too short',
            test: '^[a-zA-Z]{6,}$',
            type: 'error'
          },
          {
            error: 'TestMe Field must contain Caps',
            test: '[A-Z]',
            type: 'error'
          },
          {
            error: 'Preferred if TestMe Field has 2 caps',
            test: '[A-Z]{2}',
            type: 'warning'
          }
        ],
        errors: this.state.testMeError
      }
    };

    return (
      this.setState({
        [`${fieldName}Error`]: this.createErrorArr(rules[fieldName].validation, value)
      },
        cb
      )
    );
  }

  render() {
    return (
      <form name='testFrom' onSubmit={this.handleSubmit}>
        <div className='row'>
          <Input
            inputSize='small-5'
            htmlId='testMe'
            value={this.state.testMe}
            name='testMe'
            label='Advanced Validation'
            onChange={this.handleChange}
            inputHelpText='Field Must contain at least 6 characters and 1 capital letter'
            errorArr={this.state.testMeError}
          />
        </div>
          {this.props.children}
      </form>
    );
  }
}

**/

/**
* @name Input with clear button
* @description You can use the built in clear functionality
*
* @category controls
* @component input
* @section clear
*
* @js

export default class Clear extends React.PureComponent {
  state = {
    value: 'Press or click the clear icon to clear this input'
  };

  handleChange = (event) => {
    this.setState({value: event.target.value});
  }

  render() {
    return (
      <div className='row'>
      <Input
        name='clearInput'
        label='Input with clear'
        htmlId='clearInput'
        inputSize='small-5'
        placeholder='Placeholder Text'
        value={this.state.value}
        onChange={this.handleChange}
        clear
      />
    </div>
    );
  }
}


**/
