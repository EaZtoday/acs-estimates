"use server";

import { customerService, type CreateCustomerInput, type Customer } from "@/lib/api/customers";
import { revalidateTag } from "next/cache";
import { customerCreateSchema, customerUpdateSchema } from "@/lib/validation/schemas";
import {
  createActionResponse,
  handleActionError,
  validateFormData,
  handleFailedAction,
  isForeignKeyConstraintError,
  getDuplicateConstraintMessage,
  type ActionResponse,
} from "./utils";

// Create a new customer
export async function createCustomer(
  prevState: ActionResponse<unknown> | null,
  formData: FormData
): Promise<ActionResponse<unknown>> {
  try {
    // Validate form data
    const validation = validateFormData(formData, customerCreateSchema);
    if (!validation.success) {
      return handleFailedAction(validation.error);
    }

    // Create the customer
    const customerData: CreateCustomerInput = {
      ...validation.data,
    };

    await customerService.create(customerData);

    // Revalidate paths
    revalidateTag('customers', 'max');
    revalidateTag('organizations', 'max'); // Since customers affect org customer counts
    revalidateTag('dashboard', 'max');
    revalidateTag('settings', 'max');
    
    // Return success response instead of redirecting
    return createActionResponse({ success: true, message: "Customer created successfully" });
  } catch (error) {
    // Handle duplicate email constraint error specifically
    const duplicateMessage = getDuplicateConstraintMessage(error, "email address");
    if (duplicateMessage) {
      return handleFailedAction(duplicateMessage);
    }
    
    return handleFailedAction(handleActionError(error));
  }
}

// Update an existing customer
export async function updateCustomer(
  prevState: ActionResponse<unknown> | null,
  formData: FormData
): Promise<ActionResponse<unknown>> {
  try {
    // Get the customer ID from form data
    const customerId = formData.get("id") as string;
    if (!customerId) {
      return handleFailedAction("Customer ID is required");
    }

    // Validate form data
    const validation = validateFormData(formData, customerUpdateSchema);
    if (!validation.success) {
      return handleFailedAction(validation.error);
    }

    // Update the customer
    const customerData: Partial<Customer> = {
      ...validation.data,
    };

    await customerService.update(customerId, customerData);

    // Revalidate paths
    revalidateTag('customers', 'max');
    revalidateTag('organizations', 'max'); // Since customers affect org customer counts
    revalidateTag('dashboard', 'max');
    revalidateTag('settings', 'max');
    
    return createActionResponse({ success: true, message: "Customer updated successfully" });
  } catch (error) {
    // Handle duplicate email constraint error specifically
    const duplicateMessage = getDuplicateConstraintMessage(error, "email address");
    if (duplicateMessage) {
      return handleFailedAction(duplicateMessage);
    }
    
    return handleFailedAction(handleActionError(error));
  }
}

// Delete a customer
export async function deleteCustomer(
  prevState: ActionResponse<unknown> | null,
  formData: FormData
): Promise<ActionResponse<unknown>> {
  try {
    const customerId = formData.get("id") as string;
    if (!customerId) {
      return handleFailedAction("Customer ID is required");
    }

    await customerService.delete(customerId);

    // Revalidate paths
    revalidateTag('customers', 'max');
    revalidateTag('organizations', 'max'); // Since customers affect org customer counts
    revalidateTag('dashboard', 'max');
    revalidateTag('settings', 'max');
    
    return createActionResponse({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    if (isForeignKeyConstraintError(error)) {
      return handleFailedAction("Cannot delete customer because it is referenced by other records");
    }
    return handleFailedAction(handleActionError(error));
  }
}
