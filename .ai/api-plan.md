# REST API Plan

## 1. Resources

- **Users**: Managed by Supabase authentication; includes email, id, created_at, and updated_at.
- **Topics**: Represents categories with hierarchical structure (table: topics) containing fields like id, user_id, name, description, and parent_id.
- **Documents**: Source documents for flashcards (table: documents) with fields id, user_id, name, and content.
- **Flashcards**: Contains flashcard data with original and modified content, source information (ai or manual), modification_percentage, approval status, and a soft delete flag (is_disabled).
- **Study Sessions**: Represents user study sessions with fields such as start_time, end_time, and cards_reviewed.
- **Study Session Results**: Stores results for flashcards review (is_correct, response_time, difficulty_rating, etc.).
- **User Statistics**: Aggregated statistics per user (total_cards_created, total_cards_studied, correct_answers, incorrect_answers, etc.).
- Study Sessions (table: study_sessions) – *Planned for future iteration (Module II)*
- Study Session Results (table: study_session_results) – *Deferred implementation*
- User Statistics (table: user_statistics) – *To be implemented post-MVP*

## 2. Endpoints

### Authentication Endpoints

#### 1. POST /api/auth/register
- **Description**: Register a new user.
- **Request Payload**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response Payload**:
  ```json
  {
    "id": "string",
    "email": "string",
    "created_at": "ISODate string",
    "updated_at": "ISODate string"
  }
  ```
- **Success Codes**: 201 Created - "User successfully registered"
- **Error Codes**: 400 Bad Request, 409 Conflict (if email already exists)

#### 2. POST /api/auth/login
- **Description**: Authenticate the user and return a JWT token.
- **Request Payload**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response Payload**:
  ```json
  {
    "token": "JWT string",
    "user": {
      "id": "string",
      "email": "string",
      "created_at": "ISODate string",
      "updated_at": "ISODate string"
    }
  }
  ```
- **Success Codes**: 200 OK - "Login successful"
- **Error Codes**: 400 Bad Request, 401 Unauthorized

#### 3. POST /api/auth/logout
- **Description**: Log out the current user.
- **Response Payload**:
  ```json
  {
    "message": "Logout successful"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized

#### 4. POST /api/auth/reset-password
- **Description**: Initiate a password reset process.
- **Request Payload**:
  ```json
  {
    "email": "string"
  }
  ```
- **Response Payload**:
  ```json
  {
    "message": "Password reset instructions sent"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 404 Not Found

### Topics Endpoints

#### 1. GET /api/topics
- **Description**: Retrieve a list of topics for the authenticated user.
- **Query Parameters**: 
  - `page` (number)
  - `limit` (number)
  - `sort` (string)
  - `parent_id` (string, optional)
- **Response Payload**:
  ```json
  {
    "topics": [
      {
        "id": "string",
        "user_id": "string",
        "name": "string",
        "description": "string",
        "parent_id": "string or null",
        "created_at": "ISODate string",
        "updated_at": "ISODate string"
      }
    ],
    "total": "number"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 500 Internal Server Error

#### 2. POST /api/topics
- **Description**: Create a new topic.
- **Request Payload**:
  ```json
  {
    "name": "string",
    "description": "string",
    "parent_id": "string (optional)"
  }
  ```
- **Response Payload**:
  ```json
  {
    "id": "string",
    "user_id": "string",
    "name": "string",
    "description": "string",
    "parent_id": "string or null",
    "created_at": "ISODate string",
    "updated_at": "ISODate string"
  }
  ```
- **Success Codes**: 201 Created
- **Error Codes**: 400 Bad Request, 401 Unauthorized, 415 Unsupported Media Type, 500 Internal Server Error

#### 3. GET /api/topics/{id}
- **Description**: Retrieve details of a specific topic.
- **Response Payload**:
  ```json
  {
    "id": "string",
    "user_id": "string",
    "name": "string",
    "description": "string",
    "parent_id": "string or null",
    "created_at": "ISODate string",
    "updated_at": "ISODate string"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 404 Not Found, 500 Internal Server Error

#### 4. PUT /api/topics/{id}
- **Description**: Update an existing topic.
- **Request Payload** (example):
  ```json
  {
    "name": "string",
    "description": "string"
  }
  ```
- **Response Payload**:
  ```json
  {
    "id": "string",
    "user_id": "string",
    "name": "string",
    "description": "string",
    "parent_id": "string or null",
    "created_at": "ISODate string",
    "updated_at": "ISODate string"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 401 Unauthorized, 404 Not Found, 415 Unsupported Media Type, 500 Internal Server Error

#### 5. DELETE /api/topics/{id}
- **Description**: Delete a topic.
- **Response Payload**:
  ```json
  {
    "message": "Topic deleted successfully"
  }
  ```
- **Success Codes**: 204 No Content
- **Error Codes**: 400 Bad Request, 404 Not Found, 409 Conflict (if topic has children or documents), 500 Internal Server Error

### Documents Endpoints

#### 1. GET /api/documents
- **Description**: Retrieve a list of documents.
- **Query Parameters**: 
  - `page` (number)
  - `limit` (number)
  - `sort` (string)
  - `name` (string, optional for filtering)
- **Response Payload**:
  ```json
  {
    "data": [
      {
        "id": "string",
        "user_id": "string",
        "name": "string",
        "content": "string",
        "created_at": "ISODate string",
        "updated_at": "ISODate string",
        "flashcards_count": "number",
        "ai_flashcards_count": "number",
        "manual_flashcards_count": "number"
      }
    ],
    "pagination": {
      "page": "number",
      "limit": "number",
      "total": "number",
      "total_pages": "number"
    }
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 500 Internal Server Error

#### 2. POST /api/documents
- **Description**: Create a new document. After successful creation, an AI flashcard generation process is automatically initiated.
- **Request Payload**:
  ```json
  {
    "name": "string",
    "content": "string",
    "topic_id": "string (optional)"
  }
  ```
- **Response Payload**:
  ```json
  {
    "id": "string",
    "user_id": "string",
    "name": "string",
    "content": "string",
    "topic_id": "string or null",
    "created_at": "ISODate string",
    "updated_at": "ISODate string"
  }
  ```
- **Success Codes**: 201 Created
- **Error Codes**: 400 Bad Request, 500 Internal Server Error

#### 3. GET /api/documents/{id}
- **Description**: Retrieve details of a specific document.
- **Response Payload**:
  ```json
  {
    "id": "string",
    "user_id": "string",
    "name": "string",
    "content": "string",
    "topic_id": "string or null",
    "created_at": "ISODate string",
    "updated_at": "ISODate string"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 404 Not Found, 500 Internal Server Error

#### 4. PUT /api/documents/{id}
- **Description**: Update an existing document.
- **Request Payload**:
  ```json
  {
    "name": "string",
    "content": "string"
  }
  ```
- **Response Payload**:
  ```json
  {
    "id": "string",
    "user_id": "string",
    "name": "string",
    "content": "string",
    "topic_id": "string or null",
    "created_at": "ISODate string",
    "updated_at": "ISODate string"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 404 Not Found, 500 Internal Server Error

#### 5. DELETE /api/documents/{id}
- **Description**: Delete a document.
- **Response Payload**:
  ```json
  {
    "message": "Document deleted successfully"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 404 Not Found, 500 Internal Server Error

### Flashcards Endpoints

#### 1. GET /api/flashcards
- **Description**: Retrieve a list of flashcards.
- **Query Parameters**: 
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `sort` (string)
  - `document_id` (string)
  - `topic_id` (string)
  - `source` (string, 'ai' or 'manual')
  - `is_approved` (boolean)
  - `is_disabled` (boolean)
- **Response Payload**:
  ```json
  {
    "data": [
      {
        "id": "string",
        "user_id": "string",
        "document_id": "string or null",
        "topic_id": "string or null",
        "front_original": "string",
        "back_original": "string",
        "front_modified": "string or null",
        "back_modified": "string or null",
        "source": "ai | manual",
        "is_modified": "boolean",
        "is_approved": "boolean",
        "modification_percentage": "number",
        "is_disabled": "boolean",
        "created_at": "ISODate string",
        "updated_at": "ISODate string"
      }
    ],
    "pagination": {
      "page": "number",
      "limit": "number",
      "total": "number",
      "total_pages": "number"
    }
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 500 Internal Server Error

#### 2. POST /api/flashcards
- **Description**: Create new flashcards manually.
- **Request Payload**:
  ```json
  {
    "flashcards": [
      {
        "front_original": "string",
        "back_original": "string",
        "document_id": "string (optional)",
        "topic_id": "string (optional)",
        "source": "manual"
      }
    ]
  }
  ```
- **Response Payload**:
  ```json
  {
    "message": "Flashcards created successfully"
  }
  ```
- **Success Codes**: 201 Created
- **Error Codes**: 400 Bad Request, 500 Internal Server Error

#### 3. GET /api/flashcards/{id}
- **Description**: Retrieve details of a specific flashcard.
- **Response Payload**:
  ```json
  {
    "id": "string",
    "user_id": "string",
    "document_id": "string or null",
    "topic_id": "string or null",
    "front_original": "string",
    "back_original": "string",
    "front_modified": "string or null",
    "back_modified": "string or null",
    "source": "ai | manual",
    "is_modified": "boolean",
    "is_approved": "boolean",
    "modification_percentage": "number",
    "is_disabled": "boolean",
    "created_at": "ISODate string",
    "updated_at": "ISODate string"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 404 Not Found, 500 Internal Server Error

#### 4. PUT /api/flashcards/{id}
- **Description**: Update a flashcard's content.
- **Request Payload**:
  ```json
  {
    "front_modified": "string (optional)",
    "back_modified": "string (optional)"
  }
  ```
- **Response Payload**:
  ```json
  {
    "message": "Flashcard updated successfully",
    "data": {
      "id": "string",
      "user_id": "string",
      "document_id": "string or null",
      "topic_id": "string or null",
      "front_original": "string",
      "back_original": "string",
      "front_modified": "string or null",
      "back_modified": "string or null",
      "source": "ai | manual",
      "is_modified": "boolean",
      "is_approved": "boolean",
      "modification_percentage": "number",
      "is_disabled": "boolean",
      "created_at": "ISODate string",
      "updated_at": "ISODate string"
    }
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 404 Not Found, 500 Internal Server Error

#### 5. DELETE /api/flashcards/{id}
- **Description**: Delete a flashcard. For AI-generated flashcards, performs a soft-delete by setting `is_disabled` to true. For manually created flashcards, performs a hard-delete (completely removes the record from the database).
- **Response Payload**:
  ```json
  {
    "message": "Flashcard deleted successfully"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 404 Not Found, 500 Internal Server Error

#### 6. PATCH /api/flashcards/{id}/approve
- **Description**: Approve a single AI-generated flashcard.
- **Response Payload**:
  ```json
  {
    "message": "Flashcard approved successfully",
    "data": {
      "id": "string",
      "user_id": "string",
      "document_id": "string or null",
      "topic_id": "string or null",
      "front_original": "string",
      "back_original": "string",
      "front_modified": "string or null",
      "back_modified": "string or null",
      "source": "ai",
      "is_modified": "boolean",
      "is_approved": "boolean",
      "modification_percentage": "number",
      "is_disabled": "boolean",
      "created_at": "ISODate string",
      "updated_at": "ISODate string"
    }
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 404 Not Found, 500 Internal Server Error

#### 7. PATCH /api/flashcards/approve-bulk
- **Description**: Approve multiple AI-generated flashcards in bulk.
- **Request Payload**:
  ```json
  {
    "flashcard_ids": ["string"]
  }
  ```
- **Response Payload**:
  ```json
  {
    "message": "Flashcards approved successfully",
    "data": {
      "approved_count": "number",
      "flashcards": [
        {
          "id": "string",
          "user_id": "string",
          "document_id": "string or null",
          "topic_id": "string or null",
          "front_original": "string",
          "back_original": "string",
          "front_modified": "string or null",
          "back_modified": "string or null",
          "source": "ai",
          "is_modified": "boolean",
          "is_approved": "boolean",
          "modification_percentage": "number",
          "is_disabled": "boolean",
          "created_at": "ISODate string",
          "updated_at": "ISODate string"
        }
      ]
    }
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 500 Internal Server Error

#### 8. PATCH /api/flashcards/approve-by-document
- **Description**: Approve all AI-generated flashcards related to a specific document.
- **Request Payload**:
  ```json
  {
    "document_id": "string"
  }
  ```
- **Response Payload**:
  ```json
  {
    "data": {
      "approved_count": "number",
      "flashcards": [
        {
          "id": "string",
          "user_id": "string",
          "document_id": "string or null",
          "topic_id": "string or null",
          "front_original": "string",
          "back_original": "string",
          "front_modified": "string or null",
          "back_modified": "string or null",
          "source": "ai",
          "is_modified": "boolean",
          "is_approved": "boolean",
          "modification_percentage": "number",
          "is_disabled": "boolean",
          "created_at": "ISODate string",
          "updated_at": "ISODate string"
        }
      ]
    }
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 404 Not Found, 500 Internal Server Error

##### AI-Generated Flashcards

###### 1. POST /api/flashcards/ai-generate
- **Description**: Generate flashcards automatically using an AI model based on input text.
- **Request Payload**:
  ```json
  {
    "text": "string",
    "document_id": "string (optional)",
    "topic_id": "string (optional)"
  }
  ```
- **Response Payload**:
  ```json
  {
    "flashcards": [
      {
        "id": "string",
        "user_id": "string",
        "document_id": "string or null",
        "topic_id": "string or null",
        "front_original": "string",
        "back_original": "string",
        "front_modified": "string or null",
        "back_modified": "string or null",
        "source": "ai",
        "is_modified": "boolean",
        "is_approved": "boolean",
        "modification_percentage": "number",
        "is_disabled": "boolean",
        "created_at": "ISODate string",
        "updated_at": "ISODate string"
      }
    ]
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 500 Internal Server Error

###### 2. POST /api/flashcards/ai-regenerate
- **Description**: Re-generate flashcards for an existing document or text. This endpoint soft-deletes all existing AI-generated flashcards (regardless of their `is_disabled` and `is_approved` status) associated with the document_id (if provided) and generates new ones.
- **Request Payload**:
  ```json
  {
    "text": "string",
    "document_id": "string (optional)",
    "topic_id": "string (optional)",
    "force_regenerate": "boolean (optional, default: false)"
  }
  ```
- **Processing Steps**:
  1. If document_id is provided, find all existing AI-generated flashcards associated with this document
  2. Mark all found flashcards as disabled (soft-delete) by setting `is_disabled` = true
  3. Generate new flashcards using the AI service
  4. Save the newly generated flashcards to the database
- **Response Payload**:
  ```json
  {
    "flashcards": [
      {
        "id": "string",
        "user_id": "string",
        "document_id": "string or null",
        "topic_id": "string or null",
        "front_original": "string",
        "back_original": "string",
        "front_modified": "string or null",
        "back_modified": "string or null",
        "source": "ai",
        "is_modified": "boolean",
        "is_approved": "boolean",
        "modification_percentage": "number",
        "is_disabled": "boolean",
        "created_at": "ISODate string",
        "updated_at": "ISODate string"
      }
    ],
    "disabled_count": "number"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 404 Not Found (if document_id is provided but not found), 500 Internal Server Error

### Study Sessions Endpoints

#### 1. GET /api/study-sessions
- **Description**: Retrieve a list of study sessions.
- **Query Parameters**: 
  - `page` (number)
  - `limit` (number)
  - `sort` (string)
  - `date` (string in ISO format, optional)
- **Response Payload**:
  ```json
  {
    "study_sessions": [
      {
        "id": "string",
        "user_id": "string",
        "topic_id": "string or null",
        "start_time": "ISODate string",
        "end_time": "ISODate string or null",
        "cards_reviewed": "number",
        "created_at": "ISODate string"
      }
    ],
    "total": "number"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 500 Internal Server Error

#### 2. POST /api/study-sessions
- **Description**: Create a new study session.
- **Request Payload**:
  ```json
  {
    "topic_id": "string (optional)"
  }
  ```
- **Response Payload**:
  ```json
  {
    "id": "string",
    "user_id": "string",
    "topic_id": "string or null",
    "start_time": "ISODate string",
    "end_time": "ISODate string or null",
    "cards_reviewed": "number",
    "created_at": "ISODate string"
  }
  ```
- **Success Codes**: 201 Created
- **Error Codes**: 400 Bad Request, 401 Unauthorized

#### 3. GET /api/study-sessions/{id}
- **Description**: Retrieve details of a specific study session.
- **Response Payload**:
  ```json
  {
    "id": "string",
    "user_id": "string",
    "topic_id": "string or null",
    "start_time": "ISODate string",
    "end_time": "ISODate string or null",
    "cards_reviewed": "number",
    "created_at": "ISODate string"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 404 Not Found

#### 4. PUT /api/study-sessions/{id}
- **Description**: Update study session details (e.g., end time).
- **Request Payload**:
  ```json
  {
    "end_time": "ISODate string"
  }
  ```
- **Response Payload**:
  ```json
  {
    "id": "string",
    "user_id": "string",
    "topic_id": "string or null",
    "start_time": "ISODate string",
    "end_time": "ISODate string or null",
    "cards_reviewed": "number",
    "created_at": "ISODate string"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 401 Unauthorized, 404 Not Found

#### 5. DELETE /api/study-sessions/{id}
- **Description**: Optionally cancel a study session.
- **Response Payload**:
  ```json
  {
    "message": "Study session cancelled successfully"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 404 Not Found

### Study Session Results Endpoints

#### 1. GET /api/study-session-results
- **Description**: Retrieve a list of study session results.
- **Query Parameters**: 
  - `page` (number)
  - `limit` (number)
  - `sort` (string)
  - `session_id` (string, optional)
- **Response Payload**:
  ```json
  {
    "results": [
      {
        "id": "string",
        "session_id": "string",
        "flashcard_id": "string",
        "is_correct": "boolean",
        "response_time": "number",
        "difficulty_rating": "number or null",
        "created_at": "ISODate string"
      }
    ],
    "total": "number"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 500 Internal Server Error

#### 2. POST /api/study-session-results
- **Description**: Record a new study session result.
- **Request Payload**:
  ```json
  {
    "session_id": "string",
    "flashcard_id": "string",
    "is_correct": "boolean",
    "response_time": "number",
    "difficulty_rating": "number (optional)"
  }
  ```
- **Response Payload**:
  ```json
  {
    "id": "string",
    "session_id": "string",
    "flashcard_id": "string",
    "is_correct": "boolean",
    "response_time": "number",
    "difficulty_rating": "number or null",
    "created_at": "ISODate string"
  }
  ```
- **Success Codes**: 201 Created
- **Error Codes**: 400 Bad Request, 401 Unauthorized

#### 3. GET /api/study-session-results/{id}
- **Description**: Retrieve details of a specific study session result.
- **Response Payload**:
  ```json
  {
    "id": "string",
    "session_id": "string",
    "flashcard_id": "string",
    "is_correct": "boolean",
    "response_time": "number",
    "difficulty_rating": "number or null",
    "created_at": "ISODate string"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 404 Not Found

### User Statistics Endpoints

#### GET /api/statistics
- **Description**: Retrieve aggregated statistics for the authenticated user.
- **Response Payload**:
  ```json
  {
    "user_id": "string",
    "total_cards_created": "number",
    "total_cards_studied": "number",
    "correct_answers": "number",
    "incorrect_answers": "number",
    "average_response_time": "number",
    "study_streak_days": "number",
    "last_study_date": "ISODate string",
    "created_at": "ISODate string",
    "updated_at": "ISODate string"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 500 Internal Server Error

### Future Endpoints (Planned for later modules)

These endpoints are part of the complete system scope but are **not implemented in the current MVP**. They will be added in **Module II – Going LIVE** and beyond.

- Authentication endpoints (register, login, logout, reset password)
- Study session management:
  - `GET /api/study-sessions`
  - `POST /api/study-sessions`
  - `GET /api/study-sessions/{id}` etc.
- Study session results
- User statistics

## 3. Authentication and Authorization

- Authentication will be implemented in **Module II** using Supabase Auth with JWT-based authorization.
- Until then, all endpoints can be tested without secure user sessions. When enabled, protected endpoints will require the header:
  `Authorization: Bearer <token>`
- Supabase RLS (Row Level Security) is leveraged to ensure that users only access their own data.
- Endpoints related to user registration and login are public, while all other endpoints require authentication.

### Service Implementation Details

#### AiGenerateService

The AiGenerateService requires extension to support the flashcard regeneration functionality:

```typescript
// Extension to ai-generate.service.ts
class AiGenerateService {
  // Existing methods...
  
  /**
   * Regenerate flashcards for a document or text
   * This method will:
   * 1. Soft-delete existing AI-generated flashcards for the document (if document_id is provided)
   * 2. Generate new flashcards using the AI model
   * 3. Save the new flashcards to the database
   */
  async regenerateFlashcards(data: FlashcardAiRegenerateDto): Promise<FlashcardAiRegenerateResponse> {
    let disabledCount = 0;
    
    // If document_id is provided, find and soft-delete existing AI flashcards
    if (data.document_id) {
      const { data: existingFlashcards, error } = await this.supabase
        .from("flashcards")
        .update({ is_disabled: true })
        .eq("document_id", data.document_id)
        .eq("source", "ai")
        .select("id");
        
      if (error) throw error;
      disabledCount = existingFlashcards?.length || 0;
    }
    
    // Generate new flashcards using the existing method
    const { flashcards } = await this.generateFlashcards(data);
    
    return {
      flashcards,
      disabled_count: disabledCount
    };
  }
}
```

#### Required Types

The following types should be added to the types.ts file to support the flashcard regeneration functionality:

```typescript
// Extension to types.ts

// Input DTO for flashcard regeneration
export interface FlashcardAiRegenerateDto extends FlashcardAiGenerateDto {
  // If true, force regeneration even if some flashcards are already approved
  force_regenerate?: boolean;
}

// Response type for flashcard regeneration
export interface FlashcardAiRegenerateResponse extends FlashcardAiResponse {
  // Number of flashcards that were soft-deleted (marked as disabled)
  disabled_count: number;
}
```

#### Schema Validation

For input validation, a Zod schema should be created:

```typescript
// Extension to ai-generate.schema.ts

// Schema for flashcard regeneration
export const flashcardAiRegenerateSchema = z.object({
  text: z.string().min(1, "Tekst jest wymagany").max(50000, "Tekst jest zbyt długi"),
  document_id: z.string().uuid("Nieprawidłowy format UUID").optional(),
  topic_id: z.string().uuid("Nieprawidłowy format UUID").optional(),
  force_regenerate: z.boolean().optional().default(false)
});
```

## 4. Validation and Business Logic

- **Data Validation**: 
  - Ensure required fields are provided (e.g., flashcards require both front_original and back_original).
  - Validate text lengths and data types according to the database schema.
  - Enforce unique constraints (e.g., unique topic names per user and parent combination).

- **Business Logic**:
  - Flashcard updates trigger database triggers that compute the modification percentage. The API simply passes the modified fields (`front_modified` and `back_modified`).
  - AI-generated flashcards endpoints validate the input text and ensure previous rejections are handled appropriately (rejected flashcards are preserved for audit).
  - List endpoints support pagination, sorting, and filtering through query parameters (e.g., filtering flashcards by document_id or topic_id).

- **Error Handling**:
  - Endpoints return relevant HTTP status codes (400 for bad requests, 401 for unauthorized, 404 for not found, 500 for server errors) along with descriptive error messages.
  - Input sanitation and validation occur at the API layer to prevent invalid data from reaching the database.

- **Security and Performance**:
  - Rate limiting, logging, and input sanitation are implemented at the gateway or middleware level to protect the system.
  - Indexes defined in the schema (e.g., on user_id, topic_id) are leveraged to optimize query performance for list endpoints.

- **Business Logic**:
  - Flashcard updates trigger database triggers that compute the modification percentage. The API simply passes the modified fields (`front_modified` and `back_modified`).
  - AI-generated flashcards endpoints validate the input text and ensure previous rejections are handled appropriately (rejected flashcards are preserved for audit).
  - The AI regeneration endpoint (`POST /api/flashcards/ai-regenerate`) performs soft-deletion of existing AI flashcards by marking them as disabled (`is_disabled = true`) before generating new ones. This ensures that the history of previously generated flashcards is preserved while allowing users to regenerate flashcards as needed.
  - The regeneration process includes a `force_regenerate` parameter that, when set to true, allows regeneration even if some flashcards are already approved by the user.
  - List endpoints support pagination, sorting, and filtering through query parameters (e.g., filtering flashcards by document_id or topic_id).

#### Endpoint Implementation

The implementation of the `/api/flashcards/ai-regenerate` endpoint should follow this pattern:

```typescript
// Implementation in /api/flashcards/ai-regenerate.ts

import type { APIRoute } from "astro";
import { AiGenerateService } from "../../../lib/services/ai-generate.service";
import { flashcardAiRegenerateSchema } from "../../../lib/schemas/ai-generate.schema";
import { logger } from "../../../lib/services/logger.service";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    if (!request.headers.get("Content-Type")?.includes("application/json")) {
      return new Response(
        JSON.stringify({
          error: {
            code: "INVALID_CONTENT_TYPE",
            message: "Nieprawidłowy format danych",
            details: "Wymagany Content-Type: application/json",
          },
        }),
        {
          status: 415,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({
          error: {
            code: "INVALID_JSON",
            message: "Nieprawidłowy format JSON",
            details: "Nie można sparsować body requestu",
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const validationResult = flashcardAiRegenerateSchema.safeParse(body);
    if (!validationResult.success) {
      logger.info("Nieprawidłowe dane wejściowe dla regeneracji fiszek AI:");
      logger.error("Szczegóły błędów walidacji:", validationResult.error.errors);
      return new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "Nieprawidłowe dane wejściowe",
            details: validationResult.error.format(),
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Sprawdzenie czy dokument istnieje, jeśli podano document_id
    if (validationResult.data.document_id) {
      const { data: document, error } = await locals.supabase
        .from("documents")
        .select("id")
        .eq("id", validationResult.data.document_id)
        .single();

      if (error || !document) {
        return new Response(
          JSON.stringify({
            error: {
              code: "DOCUMENT_NOT_FOUND",
              message: "Dokument nie został znaleziony",
              details: "Nie można znaleźć dokumentu o podanym ID",
            },
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Inicjalizacja serwisu i regeneracja fiszek
    const aiService = new AiGenerateService(locals.supabase);
    const result = await aiService.regenerateFlashcards(validationResult.data);

    logger.debug(`Pomyślnie zregenerowano fiszki AI. Dezaktywowano ${result.disabled_count} istniejących fiszek.`);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    logger.error("Błąd podczas regenerowania fiszek AI:", error);
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Wystąpił błąd podczas regenerowania fiszek",
          details: error instanceof Error ? error.message : "Nieznany błąd",
        },
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
```

This endpoint follows the same pattern as the existing ai-generate endpoint but adds the functionality to soft-delete existing flashcards before generating new ones.

## 4. Validation and Business Logic
</rewritten_file>