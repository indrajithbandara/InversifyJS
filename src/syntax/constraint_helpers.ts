import { interfaces } from "../interfaces/interfaces";
import { Metadata } from "../planning/metadata";
import * as METADATA_KEY from "../constants/metadata_keys";
import { getServiceIdentifierAsString } from "../utils/serialization";

let traverseAncerstors = (
    request: interfaces.Request,
    constraint: interfaces.ConstraintFunction
): boolean => {

    let parent = request.parentRequest;
    if (parent !== null) {
        return constraint(parent) ? true : traverseAncerstors(parent, constraint);
    } else {
        return false;
    }
};

// This helpers use currying to help you to generate constraints

let taggedConstraint = (key: string|number|symbol) => (value: any) => {

    let constraint: interfaces.ConstraintFunction =  (request: interfaces.Request | null) =>  {
        return request !== null && request.target !== null && request.target.matchesTag(key)(value);
    };

    constraint.metaData = new Metadata(key, value);

    return constraint;
};

let namedConstraint = taggedConstraint(METADATA_KEY.NAMED_TAG);

let typeConstraint = <T>(type: (interfaces.ServiceIdentifier<T>| Function)) => (request: interfaces.Request | null) => {

    // Using index 0 because constraints are applied
    // to one binding at a time (see Planner class)
    let binding: interfaces.Binding<any> | null = null;

    if (request !== null) {
        binding = request.bindings[0];
        if (typeof type === "function") {
            let constructor = request.bindings[0].implementationType;
            return type === constructor;
        } else {
            let serviceIdentifier = binding.serviceIdentifier;
            return getServiceIdentifierAsString(serviceIdentifier) === getServiceIdentifierAsString(type);
        }
    }

    return false;
};

export { traverseAncerstors, taggedConstraint, namedConstraint, typeConstraint };
